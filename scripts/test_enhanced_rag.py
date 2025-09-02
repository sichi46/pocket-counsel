#!/usr/bin/env python3
"""
Test Script for Enhanced RAG Pipeline Improvements
Tests re-ranking, prompt engineering, and advanced chunking
"""

import sys
import os
import logging
import json
from typing import List, Dict, Any

# Add the functions/src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'functions', 'src'))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_enhanced_retrieval():
    """Test the enhanced retrieval service with re-ranking"""
    logger.info("🧪 Testing Enhanced Retrieval Service...")
    
    try:
        from enhanced_retrieval import EnhancedRetrievalService
        
        # Initialize service
        retrieval_service = EnhancedRetrievalService()
        
        # Test data
        test_query = "How many leave days is an employee entitled to per year?"
        test_documents = [
            {
                'title': 'Employment Code Act - Leave Provisions',
                'content': 'Section 15 of the Employment Code Act No. 3 of 2019 provides that every employee shall be entitled to annual leave of not less than 24 working days in each year of service.',
                'source_file': 'Employment Code Act.pdf',
                'document_type': 'employment_law'
            },
            {
                'title': 'General Employment Guidelines',
                'content': 'The general guidelines for employment in Zambia include various provisions about working conditions and employee rights.',
                'source_file': 'Employment Guidelines.pdf',
                'document_type': 'employment_law'
            },
            {
                'title': 'Business Registration Requirements',
                'content': 'Companies must register with PACRA and provide necessary documentation for business operations.',
                'source_file': 'Companies Act.pdf',
                'document_type': 'business_law'
            }
        ]
        
        # Test re-ranking
        logger.info("🔄 Testing document re-ranking...")
        re_ranked_docs = retrieval_service.re_rank_documents(test_query, test_documents, top_k=3)
        
        if re_ranked_docs:
            logger.info(f"✅ Re-ranking successful: {len(re_ranked_docs)} documents returned")
            
            # Check if documents have relevance scores
            for i, doc in enumerate(re_ranked_docs):
                relevance_score = doc.get('relevance_score', 'N/A')
                logger.info(f"   Document {i+1}: {doc['title'][:50]}... (Score: {relevance_score})")
            
            # Test filtering
            logger.info("🗑️ Testing document filtering...")
            filtered_docs = retrieval_service.filter_low_relevance_documents(re_ranked_docs, threshold=0.3)
            logger.info(f"✅ Filtering successful: {len(filtered_docs)} documents after filtering")
            
            # Test enhancement
            logger.info("🔍 Testing document enhancement...")
            enhanced_docs = retrieval_service.enhance_document_context(filtered_docs)
            logger.info(f"✅ Enhancement successful: {len(enhanced_docs)} documents enhanced")
            
            # Test metrics
            logger.info("📊 Testing retrieval metrics...")
            metrics = retrieval_service.get_retrieval_metrics(test_documents, enhanced_docs)
            logger.info(f"✅ Metrics calculated: {json.dumps(metrics, indent=2)}")
            
            return True
        else:
            logger.error("❌ Re-ranking failed - no documents returned")
            return False
            
    except Exception as e:
        logger.error(f"❌ Enhanced retrieval test failed: {str(e)}")
        logger.error(f"❌ Error type: {type(e).__name__}")
        return False

def test_enhanced_prompts():
    """Test the enhanced prompt templates"""
    logger.info("🧪 Testing Enhanced Prompt Templates...")
    
    try:
        from enhanced_prompts import EnhancedPromptTemplates
        
        # Test data
        test_query = "What are the requirements for registering a business in Zambia?"
        test_documents = [
            {
                'title': 'Companies Act Registration',
                'content': 'Section 5 of the Companies Act requires all companies to register with PACRA and provide articles of association.',
                'source_details': {
                    'legal_act': {'name': 'Companies Act', 'number': '10', 'year': '2017'},
                    'section_info': 'Section 5',
                    'source_file': 'Companies Act.pdf'
                }
            }
        ]
        
        # Test main prompt
        logger.info("📝 Testing main legal assistant prompt...")
        main_prompt = EnhancedPromptTemplates.get_main_legal_assistant_prompt(
            test_query, test_documents
        )
        logger.info(f"✅ Main prompt generated: {len(main_prompt)} characters")
        
        # Test query transformation prompt
        logger.info("🔄 Testing query transformation prompt...")
        transform_prompt = EnhancedPromptTemplates.get_query_transformation_prompt(test_query)
        logger.info(f"✅ Transformation prompt generated: {len(transform_prompt)} characters")
        
        # Test fact checking prompt
        logger.info("✅ Testing fact checking prompt...")
        test_response = "According to the Companies Act, businesses must register with PACRA."
        fact_check_prompt = EnhancedPromptTemplates.get_fact_checking_prompt(
            test_query, test_response, test_documents
        )
        logger.info(f"✅ Fact checking prompt generated: {len(fact_check_prompt)} characters")
        
        # Test simplification prompt
        logger.info("🔤 Testing simplification prompt...")
        complex_response = "The statutory requirements pursuant to the Companies Act necessitate registration with the Patents and Companies Registration Agency."
        simplify_prompt = EnhancedPromptTemplates.get_simplification_prompt(complex_response)
        logger.info(f"✅ Simplification prompt generated: {len(simplify_prompt)} characters")
        
        # Test source verification prompt
        logger.info("🔍 Testing source verification prompt...")
        source_prompt = EnhancedPromptTemplates.get_source_verification_prompt(
            test_response, test_documents
        )
        logger.info(f"✅ Source verification prompt generated: {len(source_prompt)} characters")
        
        # Test confidence assessment prompt
        logger.info("📊 Testing confidence assessment prompt...")
        confidence_prompt = EnhancedPromptTemplates.get_confidence_assessment_prompt(
            test_documents, test_query
        )
        logger.info(f"✅ Confidence assessment prompt generated: {len(confidence_prompt)} characters")
        
        # Test practical guidance prompt
        logger.info("🎯 Testing practical guidance prompt...")
        guidance_prompt = EnhancedPromptTemplates.get_practical_guidance_prompt(
            test_query, test_response
        )
        logger.info(f"✅ Practical guidance prompt generated: {len(guidance_prompt)} characters")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Enhanced prompts test failed: {str(e)}")
        logger.error(f"❌ Error type: {type(e).__name__}")
        return False

def test_advanced_chunking():
    """Test the advanced chunking service"""
    logger.info("🧪 Testing Advanced Chunking Service...")
    
    try:
        from advanced_chunking import AdvancedChunkingService
        
        # Initialize service
        chunking_service = AdvancedChunkingService(target_chunk_size=1000, overlap=200)
        
        # Test text
        test_text = """
        ACT No. 3 OF 2019
        EMPLOYMENT CODE ACT
        
        Section 15 - Annual Leave
        (1) Every employee shall be entitled to annual leave of not less than 24 working days in each year of service.
        (2) The annual leave shall be taken at such time as may be agreed between the employer and the employee.
        (3) Where an employee has not taken the full annual leave entitlement, the employer shall pay the employee in lieu of leave.
        
        Section 16 - Sick Leave
        (1) An employee who is unable to work due to illness or injury shall be entitled to sick leave.
        (2) The employer may require a medical certificate for sick leave exceeding three consecutive days.
        (3) Sick leave shall not be deducted from annual leave entitlement.
        
        Section 17 - Maternity Leave
        (1) A female employee shall be entitled to maternity leave of not less than 14 weeks.
        (2) Maternity leave shall commence not earlier than 6 weeks before the expected date of confinement.
        (3) The employer shall not terminate the employment of a female employee during maternity leave.
        """
        
        # Test advanced chunking
        logger.info("📦 Testing advanced chunking...")
        chunks = chunking_service.chunk_text_advanced(test_text, "employment_law")
        
        if chunks:
            logger.info(f"✅ Advanced chunking successful: {len(chunks)} chunks created")
            
            # Analyze chunks
            for i, chunk in enumerate(chunks):
                logger.info(f"   Chunk {i+1}:")
                logger.info(f"     Type: {chunk.get('chunk_type', 'Unknown')}")
                logger.info(f"     Strategy: {chunk.get('chunk_strategy', 'Unknown')}")
                logger.info(f"     Section: {chunk.get('section_info', 'Unknown')}")
                logger.info(f"     Legal Act: {chunk.get('legal_act', 'Unknown')}")
                logger.info(f"     Confidence: {chunk.get('confidence', 'Unknown')}")
                logger.info(f"     Word Count: {chunk.get('word_count', 'Unknown')}")
                logger.info(f"     Token Count: {chunk.get('token_count', 'Unknown')}")
                logger.info(f"     Quality: {chunk.get('metadata', {}).get('chunk_quality', 'Unknown')}")
                logger.info(f"     Text Preview: {chunk.get('text', '')[:100]}...")
                logger.info("     ---")
            
            # Test chunk quality distribution
            quality_distribution = {}
            for chunk in chunks:
                quality = chunk.get('metadata', {}).get('chunk_quality', 'Unknown')
                quality_distribution[quality] = quality_distribution.get(quality, 0) + 1
            
            logger.info(f"📊 Chunk Quality Distribution: {quality_distribution}")
            
            return True
        else:
            logger.error("❌ Advanced chunking failed - no chunks created")
            return False
            
    except Exception as e:
        logger.error(f"❌ Advanced chunking test failed: {str(e)}")
        logger.error(f"❌ Error type: {type(e).__name__}")
        return False

def test_integration():
    """Test the integration of all enhanced components"""
    logger.info("🧪 Testing Integration of Enhanced Components...")
    
    try:
        from enhanced_retrieval import EnhancedRetrievalService
        from enhanced_prompts import EnhancedPromptTemplates
        from advanced_chunking import AdvancedChunkingService
        
        # Initialize all services
        retrieval_service = EnhancedRetrievalService()
        chunking_service = AdvancedChunkingService()
        
        # Test end-to-end workflow
        logger.info("🔄 Testing end-to-end enhanced workflow...")
        
        # 1. Create test document with advanced chunking
        test_text = """
        ACT No. 10 OF 2017
        COMPANIES ACT
        
        Section 5 - Registration Requirements
        (1) Every company shall be registered with PACRA before commencing business operations.
        (2) The registration shall include articles of association and memorandum of association.
        (3) A registration fee shall be paid as prescribed by regulations.
        
        Section 6 - Business Name Registration
        (1) A business name shall be registered if it is not already registered.
        (2) The business name shall be unique and not misleading.
        (3) Registration shall be valid for a period of five years.
        """
        
        # 2. Apply advanced chunking
        chunks = chunking_service.chunk_text_advanced(test_text, "business_law")
        logger.info(f"✅ Created {len(chunks)} chunks with advanced chunking")
        
        # 3. Simulate retrieval (convert chunks to document format)
        test_documents = []
        for chunk in chunks:
            test_documents.append({
                'title': f"Chunk {chunk['chunk_id']} - {chunk.get('section_info', 'General')}",
                'content': chunk['text'],
                'source_file': 'Companies Act.pdf',
                'document_type': 'business_law',
                'metadata': chunk.get('metadata', {})
            })
        
        # 4. Apply enhanced retrieval with re-ranking
        test_query = "What are the requirements for registering a business in Zambia?"
        re_ranked_docs = retrieval_service.re_rank_documents(test_query, test_documents, top_k=3)
        logger.info(f"✅ Retrieved and re-ranked {len(re_ranked_docs)} documents")
        
        # 5. Filter low-relevance documents
        filtered_docs = retrieval_service.filter_low_relevance_documents(re_ranked_docs, threshold=0.3)
        logger.info(f"✅ Filtered to {len(filtered_docs)} relevant documents")
        
        # 6. Enhance documents with context
        enhanced_docs = retrieval_service.enhance_document_context(filtered_docs)
        logger.info(f"✅ Enhanced {len(enhanced_docs)} documents with context")
        
        # 7. Generate enhanced prompt
        enhanced_prompt = EnhancedPromptTemplates.get_main_legal_assistant_prompt(
            test_query, enhanced_docs
        )
        logger.info(f"✅ Generated enhanced prompt: {len(enhanced_prompt)} characters")
        
        # 8. Calculate final metrics
        metrics = retrieval_service.get_retrieval_metrics(test_documents, enhanced_docs)
        logger.info(f"✅ Final metrics: {json.dumps(metrics, indent=2)}")
        
        logger.info("🎉 Integration test completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Integration test failed: {str(e)}")
        logger.error(f"❌ Error type: {type(e).__name__}")
        return False

def main():
    """Run all tests"""
    logger.info("🚀 Starting Enhanced RAG Pipeline Tests...")
    
    test_results = {}
    
    # Test 1: Enhanced Retrieval
    logger.info("\n" + "="*50)
    test_results['enhanced_retrieval'] = test_enhanced_retrieval()
    
    # Test 2: Enhanced Prompts
    logger.info("\n" + "="*50)
    test_results['enhanced_prompts'] = test_enhanced_prompts()
    
    # Test 3: Advanced Chunking
    logger.info("\n" + "="*50)
    test_results['advanced_chunking'] = test_advanced_chunking()
    
    # Test 4: Integration
    logger.info("\n" + "="*50)
    test_results['integration'] = test_integration()
    
    # Summary
    logger.info("\n" + "="*50)
    logger.info("📊 TEST RESULTS SUMMARY")
    logger.info("="*50)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"{test_name}: {status}")
        if result:
            passed += 1
    
    logger.info(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! Enhanced RAG pipeline is ready for deployment.")
        return True
    else:
        logger.error(f"💥 {total - passed} tests failed. Please review the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
