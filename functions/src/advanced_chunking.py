"""
Advanced Chunking Service for Pocket Counsel RAG System
Implements semantic and structural chunking for better context preservation
"""

import logging
import re
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
import tiktoken

logger = logging.getLogger(__name__)

@dataclass
class ChunkMetadata:
    """Metadata for each text chunk"""
    chunk_id: int
    start_pos: int
    end_pos: int
    chunk_type: str  # 'section', 'paragraph', 'semantic', 'mixed'
    section_info: str
    legal_act: str
    confidence: float
    word_count: int
    token_count: int

class AdvancedChunkingService:
    """Advanced chunking service with semantic and structural awareness"""
    
    def __init__(self, target_chunk_size: int = 1000, overlap: int = 200):
        """
        Initialize the advanced chunking service
        
        Args:
            target_chunk_size: Target size for chunks in tokens
            overlap: Overlap between chunks in tokens
        """
        self.target_chunk_size = target_chunk_size
        self.overlap = overlap
        
        # Initialize NLTK components
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        
        # Initialize tokenizer
        try:
            self.tokenizer = tiktoken.get_encoding("cl100k_base")
        except Exception as e:
            logger.warning(f"⚠️ Could not initialize tiktoken: {str(e)}")
            self.tokenizer = None
        
        # Legal document patterns
        self.legal_patterns = {
            'section_header': r'^(?:Section|Article|Part|Chapter|Division)\s+(\d+[A-Z]*)',
            'act_header': r'^(?:ACT|Act)\s+(?:No\.\s*)?(\d+)\s+OF\s+(\d{4})',
            'subsection': r'^(\d+\.)\s+',
            'paragraph_break': r'\n\s*\n',
            'sentence_end': r'[.!?]\s+',
            'legal_terms': r'\b(?:shall|must|may|will|should|hereby|thereof|whereas|provided|notwithstanding)\b'
        }
        
        logger.info(f"✅ Advanced chunking service initialized (target: {target_chunk_size} tokens, overlap: {overlap})")
    
    def chunk_text_advanced(self, text: str, document_type: str = "legal_document") -> List[Dict[str, Any]]:
        """
        Advanced chunking with semantic and structural awareness
        
        Args:
            text: Text to chunk
            document_type: Type of document for specialized processing
            
        Returns:
            List of enhanced chunks with metadata
        """
        try:
            logger.info(f"🔄 Starting advanced chunking for {len(text)} characters")
            
            # Step 1: Identify structural boundaries
            structural_chunks = self._identify_structural_boundaries(text)
            
            # Step 2: Apply semantic chunking within structural boundaries
            semantic_chunks = self._apply_semantic_chunking(text, structural_chunks)
            
            # Step 3: Optimize chunk sizes and overlaps
            optimized_chunks = self._optimize_chunk_sizes(semantic_chunks)
            
            # Step 4: Enhance chunks with metadata
            enhanced_chunks = self._enhance_chunks_with_metadata(optimized_chunks, text, document_type)
            
            logger.info(f"✅ Advanced chunking completed: {len(enhanced_chunks)} chunks created")
            return enhanced_chunks
            
        except Exception as e:
            logger.error(f"❌ Advanced chunking failed: {str(e)}")
            # Fallback to basic chunking
            return self._fallback_chunking(text)
    
    def _identify_structural_boundaries(self, text: str) -> List[Tuple[int, int, str]]:
        """Identify structural boundaries in the text"""
        boundaries = []
        
        try:
            # Find section headers
            section_matches = list(re.finditer(self.legal_patterns['section_header'], text, re.MULTILINE | re.IGNORECASE))
            
            # Find act headers
            act_matches = list(re.finditer(self.legal_patterns['act_header'], text, re.MULTILINE | re.IGNORECASE))
            
            # Find paragraph breaks
            paragraph_matches = list(re.finditer(self.legal_patterns['paragraph_break'], text))
            
            # Combine all boundaries
            all_boundaries = []
            
            for match in section_matches:
                all_boundaries.append((match.start(), 'section_header', match.group(0)))
            
            for match in act_matches:
                all_boundaries.append((match.start(), 'act_header', match.group(0)))
            
            for match in paragraph_matches:
                all_boundaries.append((match.start(), 'paragraph_break', ''))
            
            # Sort by position
            all_boundaries.sort(key=lambda x: x[0])
            
            # Create boundary segments
            for i, (pos, boundary_type, content) in enumerate(all_boundaries):
                start = pos
                end = all_boundaries[i + 1][0] if i + 1 < len(all_boundaries) else len(text)
                boundaries.append((start, end, boundary_type))
            
            # If no boundaries found, create a single boundary
            if not boundaries:
                boundaries.append((0, len(text), 'general'))
            
            logger.info(f"📏 Identified {len(boundaries)} structural boundaries")
            return boundaries
            
        except Exception as e:
            logger.warning(f"⚠️ Structural boundary identification failed: {str(e)}")
            return [(0, len(text), 'general')]
    
    def _apply_semantic_chunking(self, text: str, structural_chunks: List[Tuple[int, int, str]]) -> List[Dict[str, Any]]:
        """Apply semantic chunking within structural boundaries"""
        semantic_chunks = []
        
        try:
            for start, end, boundary_type in structural_chunks:
                segment_text = text[start:end]
                
                if len(segment_text) < self.target_chunk_size * 2:  # Small enough to keep as one chunk
                    semantic_chunks.append({
                        'text': segment_text,
                        'start': start,
                        'end': end,
                        'type': boundary_type,
                        'chunk_strategy': 'structural'
                    })
                else:
                    # Apply semantic chunking to larger segments
                    sub_chunks = self._semantic_split_segment(segment_text, start)
                    semantic_chunks.extend(sub_chunks)
            
            logger.info(f"🧠 Semantic chunking applied: {len(semantic_chunks)} chunks created")
            return semantic_chunks
            
        except Exception as e:
            logger.warning(f"⚠️ Semantic chunking failed: {str(e)}")
            # Return structural chunks as fallback
            return [{
                'text': text[start:end],
                'start': start,
                'end': end,
                'type': boundary_type,
                'chunk_strategy': 'structural_fallback'
            } for start, end, boundary_type in structural_chunks]
    
    def _semantic_split_segment(self, segment_text: str, global_start: int) -> List[Dict[str, Any]]:
        """Split a segment using semantic boundaries"""
        chunks = []
        
        try:
            # Split into sentences
            sentences = sent_tokenize(segment_text)
            
            current_chunk = ""
            current_start = global_start
            chunk_tokens = 0
            
            for sentence in sentences:
                sentence_tokens = self._count_tokens(sentence)
                
                # If adding this sentence would exceed target size
                if chunk_tokens + sentence_tokens > self.target_chunk_size and current_chunk:
                    # Save current chunk
                    chunks.append({
                        'text': current_chunk.strip(),
                        'start': current_start,
                        'end': global_start + len(current_chunk),
                        'type': 'semantic',
                        'chunk_strategy': 'semantic_split'
                    })
                    
                    # Start new chunk with overlap
                    overlap_text = self._get_overlap_text(current_chunk, self.overlap)
                    current_chunk = overlap_text + sentence
                    current_start = global_start + len(current_chunk) - len(sentence)
                    chunk_tokens = self._count_tokens(overlap_text) + sentence_tokens
                else:
                    current_chunk += " " + sentence
                    chunk_tokens += sentence_tokens
            
            # Add final chunk
            if current_chunk.strip():
                chunks.append({
                    'text': current_chunk.strip(),
                    'start': current_start,
                    'end': global_start + len(segment_text),
                    'type': 'semantic',
                    'chunk_strategy': 'semantic_split'
                })
            
            return chunks
            
        except Exception as e:
            logger.warning(f"⚠️ Semantic split failed: {str(e)}")
            # Fallback to simple splitting
            return [{
                'text': segment_text,
                'start': global_start,
                'end': global_start + len(segment_text),
                'type': 'fallback',
                'chunk_strategy': 'simple_fallback'
            }]
    
    def _optimize_chunk_sizes(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Optimize chunk sizes and ensure proper overlap"""
        optimized_chunks = []
        
        try:
            for i, chunk in enumerate(chunks):
                chunk_text = chunk['text']
                chunk_tokens = self._count_tokens(chunk_text)
                
                # If chunk is too large, split it further
                if chunk_tokens > self.target_chunk_size * 1.5:
                    sub_chunks = self._split_large_chunk(chunk, chunk_tokens)
                    optimized_chunks.extend(sub_chunks)
                else:
                    optimized_chunks.append(chunk)
            
            # Ensure proper overlap between chunks
            optimized_chunks = self._ensure_proper_overlap(optimized_chunks)
            
            logger.info(f"⚡ Chunk optimization completed: {len(optimized_chunks)} optimized chunks")
            return optimized_chunks
            
        except Exception as e:
            logger.warning(f"⚠️ Chunk optimization failed: {str(e)}")
            return chunks
    
    def _split_large_chunk(self, chunk: Dict[str, Any], token_count: int) -> List[Dict[str, Any]]:
        """Split a large chunk into smaller pieces"""
        sub_chunks = []
        text = chunk['text']
        start_pos = chunk['start']
        
        try:
            # Split by sentences
            sentences = sent_tokenize(text)
            current_chunk = ""
            current_start = start_pos
            current_tokens = 0
            
            for sentence in sentences:
                sentence_tokens = self._count_tokens(sentence)
                
                if current_tokens + sentence_tokens > self.target_chunk_size and current_chunk:
                    # Save current chunk
                    sub_chunks.append({
                        'text': current_chunk.strip(),
                        'start': current_start,
                        'end': start_pos + len(current_chunk),
                        'type': chunk['type'],
                        'chunk_strategy': 'size_optimization'
                    })
                    
                    # Start new chunk
                    current_chunk = sentence
                    current_start = start_pos + len(current_chunk) - len(sentence)
                    current_tokens = sentence_tokens
                else:
                    current_chunk += " " + sentence
                    current_tokens += sentence_tokens
            
            # Add final chunk
            if current_chunk.strip():
                sub_chunks.append({
                    'text': current_chunk.strip(),
                    'start': current_start,
                    'end': start_pos + len(text),
                    'type': chunk['type'],
                    'chunk_strategy': 'size_optimization'
                })
            
            return sub_chunks
            
        except Exception as e:
            logger.warning(f"⚠️ Large chunk splitting failed: {str(e)}")
            return [chunk]
    
    def _ensure_proper_overlap(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Ensure proper overlap between chunks"""
        if len(chunks) <= 1:
            return chunks
        
        try:
            for i in range(1, len(chunks)):
                prev_chunk = chunks[i-1]
                curr_chunk = chunks[i]
                
                # Calculate overlap
                overlap_text = self._get_overlap_text(prev_chunk['text'], self.overlap)
                
                # Add overlap to current chunk if needed
                if not curr_chunk['text'].startswith(overlap_text):
                    curr_chunk['text'] = overlap_text + " " + curr_chunk['text']
                    curr_chunk['start'] = prev_chunk['end'] - len(overlap_text)
                    curr_chunk['chunk_strategy'] = 'overlap_enhanced'
            
            return chunks
            
        except Exception as e:
            logger.warning(f"⚠️ Overlap enhancement failed: {str(e)}")
            return chunks
    
    def _enhance_chunks_with_metadata(
        self, 
        chunks: List[Dict[str, Any]], 
        full_text: str, 
        document_type: str
    ) -> List[Dict[str, Any]]:
        """Enhance chunks with comprehensive metadata"""
        enhanced_chunks = []
        
        try:
            for i, chunk in enumerate(chunks):
                # Extract legal information
                legal_info = self._extract_legal_information(chunk['text'])
                section_info = self._extract_section_information(chunk['text'])
                
                # Create enhanced chunk
                enhanced_chunk = {
                    'chunk_id': i,
                    'text': chunk['text'],
                    'start_pos': chunk['start'],
                    'end_pos': chunk['end'],
                    'chunk_type': chunk['type'],
                    'chunk_strategy': chunk.get('chunk_strategy', 'unknown'),
                    'section_info': section_info,
                    'legal_act': legal_info.get('act_name', ''),
                    'act_number': legal_info.get('act_number', ''),
                    'act_year': legal_info.get('act_year', ''),
                    'word_count': len(chunk['text'].split()),
                    'token_count': self._count_tokens(chunk['text']),
                    'confidence': self._calculate_chunk_confidence(chunk),
                    'metadata': {
                        'document_type': document_type,
                        'chunk_quality': self._assess_chunk_quality(chunk),
                        'legal_terms_count': self._count_legal_terms(chunk['text']),
                        'structural_markers': self._identify_structural_markers(chunk['text'])
                    }
                }
                
                enhanced_chunks.append(enhanced_chunk)
            
            logger.info(f"🔍 Enhanced {len(enhanced_chunks)} chunks with metadata")
            return enhanced_chunks
            
        except Exception as e:
            logger.warning(f"⚠️ Chunk enhancement failed: {str(e)}")
            return chunks
    
    def _extract_legal_information(self, text: str) -> Dict[str, str]:
        """Extract legal act information from text"""
        try:
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
                match = re.search(pattern, text[:1000], re.IGNORECASE)
                if match:
                    return {
                        'act_name': match.group(1),
                        'act_number': match.group(2),
                        'act_year': match.group(3)
                    }
            
            return {}
            
        except Exception:
            return {}
    
    def _extract_section_information(self, text: str) -> str:
        """Extract section information from text"""
        try:
            section_patterns = [
                r'Section\s+(\d+[A-Z]*)',
                r'Article\s+(\d+[A-Z]*)',
                r'Part\s+(\d+[A-Z]*)',
                r'Chapter\s+(\d+[A-Z]*)'
            ]
            
            for pattern in section_patterns:
                match = re.search(pattern, text[:500], re.IGNORECASE)
                if match:
                    return f"Section {match.group(1)}"
            
            return "General"
            
        except Exception:
            return "General"
    
    def _calculate_chunk_confidence(self, chunk: Dict[str, Any]) -> float:
        """Calculate confidence score for chunk quality"""
        try:
            confidence = 0.5  # Base confidence
            
            # Boost confidence for structural chunks
            if chunk['type'] in ['section_header', 'act_header']:
                confidence += 0.2
            
            # Boost confidence for semantic chunks
            if chunk.get('chunk_strategy') == 'semantic_split':
                confidence += 0.15
            
            # Boost confidence for proper size
            text_length = len(chunk['text'])
            if 500 <= text_length <= 2000:
                confidence += 0.1
            
            # Boost confidence for legal content
            legal_terms = self._count_legal_terms(chunk['text'])
            if legal_terms > 0:
                confidence += min(0.1, legal_terms * 0.02)
            
            return min(1.0, confidence)
            
        except Exception:
            return 0.5
    
    def _assess_chunk_quality(self, chunk: Dict[str, Any]) -> str:
        """Assess the quality of a chunk"""
        try:
            confidence = self._calculate_chunk_confidence(chunk)
            
            if confidence >= 0.8:
                return "Excellent"
            elif confidence >= 0.6:
                return "Good"
            elif confidence >= 0.4:
                return "Fair"
            else:
                return "Poor"
                
        except Exception:
            return "Unknown"
    
    def _count_legal_terms(self, text: str) -> int:
        """Count legal terms in text"""
        try:
            legal_terms = re.findall(self.legal_patterns['legal_terms'], text, re.IGNORECASE)
            return len(legal_terms)
        except Exception:
            return 0
    
    def _identify_structural_markers(self, text: str) -> List[str]:
        """Identify structural markers in text"""
        try:
            markers = []
            
            if re.search(self.legal_patterns['section_header'], text, re.IGNORECASE):
                markers.append('section_header')
            
            if re.search(self.legal_patterns['act_header'], text, re.IGNORECASE):
                markers.append('act_header')
            
            if re.search(self.legal_patterns['subsection'], text):
                markers.append('subsection')
            
            return markers
            
        except Exception:
            return []
    
    def _count_tokens(self, text: str) -> int:
        """Count tokens in text"""
        try:
            if self.tokenizer:
                return len(self.tokenizer.encode(text))
            else:
                # Fallback to word count approximation
                return len(text.split()) * 1.3
        except Exception:
            return len(text.split()) * 1.3
    
    def _get_overlap_text(self, text: str, overlap_tokens: int) -> str:
        """Get overlap text for chunk continuity"""
        try:
            if self.tokenizer:
                tokens = self.tokenizer.encode(text)
                if len(tokens) <= overlap_tokens:
                    return text
                
                overlap_tokens_list = tokens[-overlap_tokens:]
                return self.tokenizer.decode(overlap_tokens_list)
            else:
                # Fallback to word-based overlap
                words = text.split()
                if len(words) <= overlap_tokens:
                    return text
                
                return ' '.join(words[-overlap_tokens:])
                
        except Exception:
            # Fallback to simple overlap
            words = text.split()
            if len(words) <= 20:
                return text
            return ' '.join(words[-20:])
    
    def _fallback_chunking(self, text: str) -> List[Dict[str, Any]]:
        """Fallback to basic chunking if advanced chunking fails"""
        try:
            logger.info("🔄 Using fallback chunking method")
            
            chunks = []
            start = 0
            chunk_id = 0
            
            while start < len(text):
                end = start + self.target_chunk_size * 4  # Approximate character count
                chunk = text[start:end]
                
                # Try to break at sentence boundary
                if end < len(text):
                    last_period = chunk.rfind('.')
                    if last_period > len(chunk) * 0.7:
                        chunk = text[start:start + last_period + 1]
                        end = start + len(chunk)
                
                chunks.append({
                    'chunk_id': chunk_id,
                    'text': chunk.strip(),
                    'start_pos': start,
                    'end_pos': end,
                    'chunk_type': 'fallback',
                    'chunk_strategy': 'fallback_basic',
                    'section_info': 'General',
                    'legal_act': '',
                    'act_number': '',
                    'act_year': '',
                    'word_count': len(chunk.strip().split()),
                    'token_count': self._count_tokens(chunk.strip()),
                    'confidence': 0.3,
                    'metadata': {
                        'document_type': 'legal_document',
                        'chunk_quality': 'Poor',
                        'legal_terms_count': 0,
                        'structural_markers': []
                    }
                })
                
                start = end - self.overlap * 4  # Approximate overlap
                chunk_id += 1
            
            logger.info(f"✅ Fallback chunking completed: {len(chunks)} chunks created")
            return chunks
            
        except Exception as e:
            logger.error(f"❌ Fallback chunking also failed: {str(e)}")
            # Last resort: return entire text as one chunk
            return [{
                'chunk_id': 0,
                'text': text,
                'start_pos': 0,
                'end_pos': len(text),
                'chunk_type': 'emergency',
                'chunk_strategy': 'emergency_fallback',
                'section_info': 'General',
                'legal_act': '',
                'act_number': '',
                'act_year': '',
                'word_count': len(text.split()),
                'token_count': self._count_tokens(text),
                'confidence': 0.1,
                'metadata': {
                    'document_type': 'legal_document',
                    'chunk_quality': 'Poor',
                    'legal_terms_count': 0,
                    'structural_markers': []
                }
            }]
