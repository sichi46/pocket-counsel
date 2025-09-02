#!/usr/bin/env python3
"""
Enhanced RAG Server for Pocket Counsel
Provides HTTP endpoints for the enhanced RAG pipeline functionality
"""

import sys
import os
import json
import logging
from typing import Dict, Any, List
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import time

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Import enhanced RAG components
try:
    from enhanced_retrieval import EnhancedRetrievalService
    from enhanced_prompts import EnhancedPromptTemplates
    from advanced_chunking import AdvancedChunkingService
    print("✅ Enhanced RAG components imported successfully")
except ImportError as e:
    print(f"❌ Failed to import enhanced RAG components: {e}")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global service instances
retrieval_service = None
prompt_templates = None
chunking_service = None

def initialize_services():
    """Initialize all enhanced RAG services"""
    global retrieval_service, prompt_templates, chunking_service
    
    try:
        logger.info("🚀 Initializing Enhanced RAG Services...")
        
        # Initialize enhanced retrieval service
        retrieval_service = EnhancedRetrievalService()
        logger.info("✅ EnhancedRetrievalService initialized")
        
        # Initialize enhanced prompt templates
        prompt_templates = EnhancedPromptTemplates()
        logger.info("✅ EnhancedPromptTemplates initialized")
        
        # Initialize advanced chunking service
        chunking_service = AdvancedChunkingService()
        logger.info("✅ AdvancedChunkingService initialized")
        
        logger.info("🎉 All Enhanced RAG services initialized successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {str(e)}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'services': {
            'enhanced_retrieval': retrieval_service is not None,
            'enhanced_prompts': prompt_templates is not None,
            'advanced_chunking': chunking_service is not None
        },
        'timestamp': time.time()
    })

@app.route('/enhanced-rag', methods=['POST'])
def enhanced_rag():
    """Main enhanced RAG endpoint"""
    try:
        # Parse request
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        query = data.get('query', '')
        documents = data.get('documents', [])
        top_k = data.get('top_k', 5)
        threshold = data.get('threshold', 0.3)
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        logger.info(f"🔄 Processing enhanced RAG request: '{query[:100]}...'")
        
        # Step 1: Re-rank documents using enhanced retrieval
        if documents:
            logger.info(f"📊 Re-ranking {len(documents)} documents...")
            re_ranked_docs = retrieval_service.re_rank_documents(
                query, documents, top_k=top_k
            )
            logger.info(f"✅ Re-ranking completed: {len(re_ranked_docs)} documents")
        else:
            re_ranked_docs = []
            logger.info("⚠️ No documents provided for re-ranking")
        
        # Step 2: Filter low-relevance documents
        if re_ranked_docs:
            filtered_docs = retrieval_service.filter_low_relevance_documents(
                re_ranked_docs, threshold=threshold
            )
            logger.info(f"🗑️ Filtering completed: {len(filtered_docs)} documents after filtering")
        else:
            filtered_docs = []
        
        # Step 3: Enhance document context
        if filtered_docs:
            enhanced_docs = retrieval_service.enhance_document_context(filtered_docs)
            logger.info(f"🔍 Context enhancement completed: {len(enhanced_docs)} documents enhanced")
        else:
            enhanced_docs = []
        
        # Step 4: Generate enhanced prompt
        if enhanced_docs:
            enhanced_prompt = prompt_templates.get_main_legal_assistant_prompt(
                query, enhanced_docs
            )
            logger.info(f"📝 Enhanced prompt generated: {len(enhanced_prompt)} characters")
        else:
            enhanced_prompt = prompt_templates.get_main_legal_assistant_prompt(
                query, []
            )
            logger.info("📝 Basic prompt generated (no documents)")
        
        # Step 5: Calculate metrics
        metrics = retrieval_service.get_retrieval_metrics(documents, enhanced_docs)
        
        # Step 6: Prepare response
        response = {
            'status': 'success',
            'query': query,
            'enhanced_prompt': enhanced_prompt,
            'documents_processed': {
                'original': len(documents),
                'after_re_ranking': len(re_ranked_docs),
                'after_filtering': len(filtered_docs),
                'after_enhancement': len(enhanced_docs)
            },
            'enhanced_documents': enhanced_docs,
            'metrics': metrics,
            'timestamp': time.time(),
            'note': 'Enhanced RAG pipeline with re-ranking, filtering, and context enhancement'
        }
        
        logger.info(f"🎉 Enhanced RAG request completed successfully")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Enhanced RAG request failed: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': time.time()
        }), 500

@app.route('/re-rank', methods=['POST'])
def re_rank_documents():
    """Document re-ranking endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        query = data.get('query', '')
        documents = data.get('documents', [])
        top_k = data.get('top_k', 5)
        
        if not query or not documents:
            return jsonify({'error': 'Query and documents are required'}), 400
        
        logger.info(f"🔄 Re-ranking {len(documents)} documents for query: '{query[:100]}...'")
        
        re_ranked_docs = retrieval_service.re_rank_documents(query, documents, top_k=top_k)
        
        response = {
            'status': 'success',
            'query': query,
            're_ranked_documents': re_ranked_docs,
            'original_count': len(documents),
            're_ranked_count': len(re_ranked_docs),
            'timestamp': time.time()
        }
        
        logger.info(f"✅ Re-ranking completed successfully")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Re-ranking request failed: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': time.time()
        }), 500

@app.route('/chunk', methods=['POST'])
def chunk_documents():
    """Document chunking endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        text = data.get('text', '')
        target_tokens = data.get('target_tokens', 1000)
        overlap = data.get('overlap', 200)
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        logger.info(f"📦 Chunking text ({len(text)} characters) with target {target_tokens} tokens")
        
        chunks = chunking_service.chunk_text_advanced(text, "legal_document")
        
        response = {
            'status': 'success',
            'original_text_length': len(text),
            'chunks_created': len(chunks),
            'chunks': chunks,
            'chunking_config': {
                'method': 'advanced_chunking',
                'document_type': 'legal_document'
            },
            'timestamp': time.time()
        }
        
        logger.info(f"✅ Chunking completed: {len(chunks)} chunks created")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Chunking request failed: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': time.time()
        }), 500

@app.route('/prompts', methods=['GET'])
def get_prompt_templates():
    """Get available prompt templates"""
    try:
        templates = {
            'main_legal_assistant': 'Generate main legal assistant prompt',
            'query_transformation': 'Transform user query into sub-queries',
            'fact_checking': 'Generate fact-checking prompt',
            'simplification': 'Generate simplification prompt',
            'source_verification': 'Generate source verification prompt',
            'confidence_assessment': 'Generate confidence assessment prompt',
            'practical_guidance': 'Generate practical guidance prompt'
        }
        
        return jsonify({
            'status': 'success',
            'available_templates': templates,
            'timestamp': time.time()
        })
        
    except Exception as e:
        logger.error(f"❌ Failed to get prompt templates: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': time.time()
        }), 500

if __name__ == '__main__':
    # Initialize services
    if not initialize_services():
        logger.error("❌ Failed to initialize services. Exiting.")
        sys.exit(1)
    
    # Start Flask server
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"🚀 Starting Enhanced RAG Server on port {port}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False,
        threaded=True
    )
