"""
Enhanced Retrieval Service for Pocket Counsel RAG System
Implements re-ranking using sentence transformers for better document relevance
"""

import logging
from typing import List, Dict, Any, Tuple
import numpy as np
from sentence_transformers import CrossEncoder
import requests
import json
import os

logger = logging.getLogger(__name__)

class EnhancedRetrievalService:
    def __init__(self):
        """Initialize the enhanced retrieval service with re-ranking capabilities"""
        try:
            # Initialize the cross-encoder for re-ranking
            # Using a smaller model for faster inference in Cloud Functions
            self.cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
            logger.info("✅ Cross-encoder initialized successfully for re-ranking")
        except Exception as e:
            logger.warning(f"⚠️ Could not initialize cross-encoder: {str(e)}")
            logger.warning("⚠️ Falling back to basic retrieval without re-ranking")
            self.cross_encoder = None
    
    def re_rank_documents(
        self, 
        query: str, 
        documents: List[Dict[str, Any]], 
        top_k: int = 8
    ) -> List[Dict[str, Any]]:
        """
        Re-rank documents using cross-encoder for better relevance
        
        Args:
            query: User's legal question
            documents: List of retrieved documents from vector search
            top_k: Number of top documents to return after re-ranking
            
        Returns:
            Re-ranked list of documents with relevance scores
        """
        if not self.cross_encoder or not documents:
            logger.info("⚠️ Skipping re-ranking - returning original documents")
            return documents[:top_k]
        
        try:
            logger.info(f"🔄 Re-ranking {len(documents)} documents for query: '{query[:100]}...'")
            
            # Prepare document pairs for cross-encoder
            document_pairs = []
            for doc in documents:
                # Extract the main content for ranking
                content = doc.get('content', '') or doc.get('text', '') or str(doc)
                document_pairs.append([query, content])
            
            # Get relevance scores from cross-encoder
            scores = self.cross_encoder.predict(document_pairs)
            
            # Combine documents with their scores
            scored_documents = []
            for i, (doc, score) in enumerate(zip(documents, scores)):
                enhanced_doc = doc.copy()
                enhanced_doc['relevance_score'] = float(score)
                enhanced_doc['original_rank'] = i
                scored_documents.append(enhanced_doc)
            
            # Sort by relevance score (descending)
            scored_documents.sort(key=lambda x: x['relevance_score'], reverse=True)
            
            # Take top_k documents
            top_documents = scored_documents[:top_k]
            
            logger.info(f"✅ Re-ranking completed. Top document score: {top_documents[0]['relevance_score']:.3f}")
            
            # Log ranking improvements
            for i, doc in enumerate(top_documents):
                original_rank = doc['original_rank']
                improvement = original_rank - i
                if improvement > 0:
                    logger.info(f"📈 Document improved by {improvement} positions: {doc.get('title', 'Unknown')[:50]}...")
            
            return top_documents
            
        except Exception as e:
            logger.error(f"❌ Re-ranking failed: {str(e)}")
            logger.error(f"❌ Error type: {type(e).__name__}")
            # Fallback to original documents
            return documents[:top_k]
    
    def filter_low_relevance_documents(
        self, 
        documents: List[Dict[str, Any]], 
        threshold: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Filter out documents with very low relevance scores
        
        Args:
            documents: List of re-ranked documents
            threshold: Minimum relevance score threshold
            
        Returns:
            Filtered list of documents above the threshold
        """
        if not documents:
            return documents
        
        try:
            # Check if documents have relevance scores
            if 'relevance_score' not in documents[0]:
                logger.info("⚠️ Documents don't have relevance scores - skipping filtering")
                return documents
            
            # Filter documents above threshold
            filtered_docs = [doc for doc in documents if doc.get('relevance_score', 0) >= threshold]
            
            removed_count = len(documents) - len(filtered_docs)
            if removed_count > 0:
                logger.info(f"🗑️ Filtered out {removed_count} low-relevance documents (threshold: {threshold})")
            
            return filtered_docs
            
        except Exception as e:
            logger.error(f"❌ Document filtering failed: {str(e)}")
            return documents
    
    def enhance_document_context(
        self, 
        documents: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Enhance documents with additional context and metadata
        
        Args:
            documents: List of documents to enhance
            
        Returns:
            Enhanced documents with additional context
        """
        try:
            enhanced_docs = []
            
            for i, doc in enumerate(documents):
                enhanced_doc = doc.copy()
                
                # Add ranking metadata
                enhanced_doc['final_rank'] = i + 1
                enhanced_doc['confidence_level'] = self._calculate_confidence_level(doc.get('relevance_score', 0))
                
                # Extract and enhance source information
                source_info = self._extract_source_info(doc)
                enhanced_doc['source_details'] = source_info
                
                # Add content summary
                content = doc.get('content', '') or doc.get('text', '')
                enhanced_doc['content_summary'] = self._generate_content_summary(content)
                
                enhanced_docs.append(enhanced_doc)
            
            logger.info(f"✅ Enhanced {len(enhanced_docs)} documents with additional context")
            return enhanced_docs
            
        except Exception as e:
            logger.error(f"❌ Document enhancement failed: {str(e)}")
            return documents
    
    def _calculate_confidence_level(self, score: float) -> str:
        """Calculate confidence level based on relevance score"""
        if score >= 0.8:
            return "Very High"
        elif score >= 0.6:
            return "High"
        elif score >= 0.4:
            return "Medium"
        elif score >= 0.2:
            return "Low"
        else:
            return "Very Low"
    
    def _extract_source_info(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and structure source information from document"""
        try:
            source_info = {
                'document_type': doc.get('document_type', 'legal_document'),
                'source_file': doc.get('source_file', 'Unknown'),
                'chunk_id': doc.get('chunk_id', 'Unknown'),
                'section_info': self._extract_section_info(doc.get('content', '')),
                'last_updated': doc.get('timestamp', 'Unknown')
            }
            
            # Try to extract legal act information
            content = doc.get('content', '') or doc.get('text', '')
            act_info = self._extract_legal_act_info(content)
            if act_info:
                source_info['legal_act'] = act_info
            
            return source_info
            
        except Exception as e:
            logger.warning(f"⚠️ Could not extract source info: {str(e)}")
            return {'document_type': 'legal_document', 'source_file': 'Unknown'}
    
    def _extract_section_info(self, content: str) -> str:
        """Extract section information from content"""
        try:
            # Look for common legal section patterns
            import re
            section_patterns = [
                r'Section\s+(\d+[A-Z]*)',
                r'Article\s+(\d+[A-Z]*)',
                r'Part\s+(\d+[A-Z]*)',
                r'Chapter\s+(\d+[A-Z]*)'
            ]
            
            for pattern in section_patterns:
                match = re.search(pattern, content[:500], re.IGNORECASE)
                if match:
                    return f"Section {match.group(1)}"
            
            return "General"
            
        except Exception:
            return "General"
    
    def _extract_legal_act_info(self, content: str) -> Dict[str, str]:
        """Extract legal act information from content"""
        try:
            import re
            
            # Look for Zambian legal act patterns
            act_patterns = [
                r'(Employment Code Act)\s+(?:No\.\s*)?(\d+)\s+of\s+(\d{4})',
                r'(Companies Act)\s+(?:No\.\s*)?(\d+)\s+of\s+(\d{4})',
                r'(Lands and Deeds Registry Act)\s+(?:No\.\s*)?(\d+)\s+of\s+(\d{4})',
                r'(Criminal Procedure Code Act)\s+(?:No\.\s*)?(\d+)\s+of\s+(\d{4})',
                r'(Children\'s Code)\s+(?:No\.\s*)?(\d+)\s+of\s+(\d{4})',
                r'(Marriage Act)\s+(?:No\.\s*)?(\d+)\s+of\s+(\d{4})'
            ]
            
            for pattern in act_patterns:
                match = re.search(pattern, content[:1000], re.IGNORECASE)
                if match:
                    return {
                        'name': match.group(1),
                        'number': match.group(2),
                        'year': match.group(3)
                    }
            
            return {}
            
        except Exception:
            return {}
    
    def _generate_content_summary(self, content: str, max_length: int = 200) -> str:
        """Generate a brief summary of document content"""
        try:
            if not content:
                return "No content available"
            
            # Take first few sentences
            sentences = content.split('.')
            summary = '. '.join(sentences[:3])
            
            if len(summary) > max_length:
                summary = summary[:max_length] + "..."
            
            return summary.strip()
            
        except Exception:
            return "Content summary unavailable"
    
    def get_retrieval_metrics(self, original_docs: List[Dict], re_ranked_docs: List[Dict]) -> Dict[str, Any]:
        """Calculate retrieval improvement metrics"""
        try:
            if not original_docs or not re_ranked_docs:
                return {}
            
            metrics = {
                'total_documents_retrieved': len(original_docs),
                'documents_after_re_ranking': len(re_ranked_docs),
                'documents_after_filtering': len([d for d in re_ranked_docs if d.get('relevance_score', 0) >= 0.3]),
                'average_relevance_score': np.mean([d.get('relevance_score', 0) for d in re_ranked_docs]),
                'top_relevance_score': max([d.get('relevance_score', 0) for d in re_ranked_docs]),
                'ranking_improvements': 0
            }
            
            # Count ranking improvements
            for i, doc in enumerate(re_ranked_docs):
                original_rank = doc.get('original_rank', i)
                if original_rank > i:
                    metrics['ranking_improvements'] += 1
            
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Could not calculate retrieval metrics: {str(e)}")
            return {}
