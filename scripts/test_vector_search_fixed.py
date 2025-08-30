#!/usr/bin/env python3
"""
Pocket Counsel Vector Search Test Script - FIXED VERSION
Tests the Vertex AI Vector Search integration using the correct deployed index endpoint
"""

import logging
import os
import sys
import time
from typing import List, Dict, Any, Optional
import json

# Google Cloud imports
import vertexai
from vertexai.language_models import TextEmbeddingModel
from google.cloud import aiplatform
from google.cloud import storage

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class VectorSearchTester:
    def __init__(self, project_id: str, location: str, index_id: str):
        self.project_id = project_id
        self.location = location
        self.index_id = index_id
        
        # Initialize Vertex AI
        vertexai.init(project=project_id, location=location)
        
        # Initialize embedding model
        self.embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")
        
        # Initialize Vector Search index for management
        self.index = aiplatform.MatchingEngineIndex(
            index_name=index_id,
            project=project_id,
            location=location
        )
        
        # Get the deployed index endpoint for searching
        self.deployed_index_endpoint = None
        self.deployed_index_id = None
        self._get_deployed_index_info()
        
        # Initialize Cloud Storage client
        self.storage_client = storage.Client()
        
        logger.info(f"✅ Initialized Vector Search Tester for project {project_id}, location {location}, index {index_id}")

    def _get_deployed_index_info(self):
        """Get information about the deployed index endpoint"""
        try:
            # Get index details to find deployed endpoint
            index_details = self.index._gca_resource
            
            if hasattr(index_details, 'deployed_indexes') and index_details.deployed_indexes:
                deployed_index = index_details.deployed_indexes[0]
                self.deployed_index_endpoint = deployed_index.index_endpoint
                self.deployed_index_id = deployed_index.deployed_index_id
                
                logger.info(f"✅ Found deployed index endpoint: {self.deployed_index_endpoint}")
                logger.info(f"✅ Deployed index ID: {self.deployed_index_id}")
            else:
                logger.warning("⚠️ No deployed indexes found")
                
        except Exception as e:
            logger.warning(f"⚠️ Could not get deployed index info: {e}")

    def test_index_connection(self) -> Dict[str, Any]:
        """Test basic connection to the Vector Search index"""
        try:
            logger.info("🔍 Testing index connection...")
            
            # Get index details
            index_details = self.index._gca_resource
            logger.info(f"✅ Successfully connected to index")
            
            # Get index stats
            try:
                if hasattr(index_details, 'index_stats'):
                    stats = index_details.index_stats
                    logger.info(f"📊 Index stats: {stats}")
                else:
                    stats = None
            except Exception as e:
                logger.warning(f"⚠️ Could not retrieve index stats: {e}")
                stats = None
            
            return {
                "status": "connected",
                "index_details": str(index_details),
                "index_stats": stats,
                "deployed_index_endpoint": self.deployed_index_endpoint,
                "deployed_index_id": self.deployed_index_id,
                "error": None
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to index: {str(e)}")
            return {
                "status": "failed",
                "index_details": None,
                "index_stats": None,
                "deployed_index_endpoint": None,
                "deployed_index_id": None,
                "error": str(e)
            }

    def test_embedding_generation(self) -> Dict[str, Any]:
        """Test that we can generate embeddings"""
        try:
            logger.info("🔄 Testing embedding generation...")
            
            test_texts = [
                "What are the legal requirements for starting a business in Zambia?",
                "How do I file for divorce in Zambia?",
                "What are the employment laws in Zambia?",
                "How do I register property in Zambia?",
                "What are the criminal law procedures in Zambia?"
            ]
            
            embeddings = self.embedding_model.get_embeddings(test_texts)
            
            results = []
            for i, embedding in enumerate(embeddings):
                embedding_values = embedding.values
                results.append({
                    "text": test_texts[i],
                    "dimensions": len(embedding_values),
                    "sample_values": embedding_values[:5]  # First 5 values
                })
                logger.info(f"✅ Generated embedding {i+1}: {len(embedding_values)} dimensions")
            
            return {
                "status": "success",
                "embeddings_generated": len(embeddings),
                "results": results,
                "error": None
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to generate embeddings: {str(e)}")
            return {
                "status": "failed",
                "embeddings_generated": 0,
                "results": [],
                "error": str(e)
            }

    def test_vector_search(self, query_text: str, num_neighbors: int = 5) -> Dict[str, Any]:
        """Test vector search functionality using the deployed index endpoint"""
        try:
            logger.info(f"🔍 Testing vector search for query: '{query_text}'")
            
            if not self.deployed_index_endpoint:
                raise Exception("No deployed index endpoint available")
            
            # Generate embedding for query
            query_embedding = self.embedding_model.get_embeddings([query_text])[0].values
            logger.info(f"✅ Generated query embedding: {len(query_embedding)} dimensions")
            
            # Create the deployed index client for searching
            deployed_index = aiplatform.MatchingEngineIndexEndpoint(
                index_endpoint_name=self.deployed_index_endpoint
            )
            
            # Perform vector search
            search_response = deployed_index.find_neighbors(
                deployed_index_id=self.deployed_index_id,
                queries=[query_embedding],
                num_neighbors=num_neighbors
            )
            
            logger.info(f"✅ Search completed successfully")
            logger.info(f"📊 Search response: {search_response}")
            
            # Parse results - handle the actual response format
            results = []
            
            # The response is a list of lists, where each inner list contains MatchNeighbor objects
            if isinstance(search_response, list) and len(search_response) > 0:
                for i, neighbor_list in enumerate(search_response):
                    if isinstance(neighbor_list, list):
                        for neighbor in neighbor_list:
                            # Extract neighbor information
                            neighbor_id = getattr(neighbor, 'id', f'neighbor_{i}')
                            neighbor_distance = getattr(neighbor, 'distance', 0.0)
                            neighbor_restricts = getattr(neighbor, 'restricts', [])
                            
                            results.append({
                                "id": neighbor_id,
                                "distance": neighbor_distance,
                                "restricts": neighbor_restricts
                            })
                            logger.info(f"🎯 Found neighbor: ID={neighbor_id}, Distance={neighbor_distance}")
                    else:
                        # Single neighbor object
                        neighbor_id = getattr(neighbor_list, 'id', f'neighbor_{i}')
                        neighbor_distance = getattr(neighbor_list, 'distance', 0.0)
                        neighbor_restricts = getattr(neighbor_list, 'restricts', [])
                        
                        results.append({
                            "id": neighbor_id,
                            "distance": neighbor_distance,
                            "restricts": neighbor_restricts
                        })
                        logger.info(f"🎯 Found neighbor: ID={neighbor_id}, Distance={neighbor_distance}")
            else:
                logger.warning("⚠️ No neighbors found in search response")
                logger.info(f"🔍 Search response type: {type(search_response)}")
                logger.info(f"🔍 Search response length: {len(search_response) if hasattr(search_response, '__len__') else 'N/A'}")
            
            return {
                "status": "success",
                "query": query_text,
                "query_embedding_dimensions": len(query_embedding),
                "num_neighbors_requested": num_neighbors,
                "num_neighbors_found": len(results),
                "results": results,
                "raw_response": str(search_response),
                "error": None
            }
            
        except Exception as e:
            logger.error(f"❌ Vector search failed: {str(e)}")
            logger.error(f"❌ Error type: {type(e).__name__}")
            return {
                "status": "failed",
                "query": query_text,
                "query_embedding_dimensions": 0,
                "num_neighbors_requested": num_neighbors,
                "num_neighbors_found": 0,
                "results": [],
                "raw_response": None,
                "error": str(e)
            }

    def test_multiple_queries(self) -> Dict[str, Any]:
        """Test multiple different queries to verify search functionality"""
        test_queries = [
            "business registration Zambia",
            "divorce procedure",
            "employment contract",
            "property law",
            "criminal procedure",
            "family law",
            "contract law",
            "constitutional rights"
        ]
        
        logger.info(f"🧪 Testing {len(test_queries)} different queries...")
        
        results = []
        successful_searches = 0
        failed_searches = 0
        
        for i, query in enumerate(test_queries):
            logger.info(f"🔍 Testing query {i+1}/{len(test_queries)}: '{query}'")
            
            try:
                search_result = self.test_vector_search(query, num_neighbors=3)
                results.append(search_result)
                
                if search_result["status"] == "success":
                    successful_searches += 1
                    logger.info(f"✅ Query '{query}' successful: {search_result['num_neighbors_found']} neighbors found")
                else:
                    failed_searches += 1
                    logger.error(f"❌ Query '{query}' failed: {search_result['error']}")
                
                # Add delay between queries
                if i < len(test_queries) - 1:
                    time.sleep(1)
                    
            except Exception as e:
                logger.error(f"❌ Unexpected error testing query '{query}': {str(e)}")
                failed_searches += 1
                results.append({
                    "status": "failed",
                    "query": query,
                    "error": str(e)
                })
        
        return {
            "total_queries": len(test_queries),
            "successful_searches": successful_searches,
            "failed_searches": failed_searches,
            "success_rate": successful_searches / len(test_queries) * 100,
            "results": results
        }

    def check_index_content(self) -> Dict[str, Any]:
        """Check what content exists in the index"""
        try:
            logger.info("🔍 Checking index content...")
            
            # Get index information
            index_details = self.index._gca_resource
            index_info = {
                "index_id": self.index_id,
                "project": self.project_id,
                "location": self.location,
                "deployed_index_endpoint": self.deployed_index_endpoint,
                "deployed_index_id": self.deployed_index_id
            }
            logger.info(f"📋 Index info: {index_info}")
            
            # Get index stats
            try:
                if hasattr(index_details, 'index_stats'):
                    stats = index_details.index_stats
                    logger.info(f"📊 Index stats: {stats}")
                else:
                    stats = None
            except Exception as e:
                logger.warning(f"⚠️ Could not get index stats: {e}")
                stats = None
            
            # Test with a very generic query to see if any vectors exist
            generic_query = "legal"
            generic_search = self.test_vector_search(generic_query, num_neighbors=10)
            
            return {
                "index_info": index_info,
                "stats": stats,
                "generic_search_test": generic_search,
                "has_vectors": generic_search["status"] == "success" and generic_search["num_neighbors_found"] > 0
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to check index content: {str(e)}")
            return {
                "index_info": None,
                "stats": None,
                "generic_search_test": None,
                "has_vectors": False,
                "error": str(e)
            }

    def run_comprehensive_test(self) -> Dict[str, Any]:
        """Run all tests and provide comprehensive results"""
        logger.info("🚀 Starting comprehensive Vector Search test...")
        
        test_results = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "project_id": self.project_id,
            "location": self.location,
            "index_id": self.index_id,
            "tests": {}
        }
        
        # Test 1: Index Connection
        logger.info("\n" + "="*50)
        logger.info("TEST 1: Index Connection")
        logger.info("="*50)
        connection_test = self.test_index_connection()
        test_results["tests"]["index_connection"] = connection_test
        
        if connection_test["status"] == "failed":
            logger.error("❌ Index connection failed. Cannot proceed with other tests.")
            return test_results
        
        # Test 2: Embedding Generation
        logger.info("\n" + "="*50)
        logger.info("TEST 2: Embedding Generation")
        logger.info("="*50)
        embedding_test = self.test_embedding_generation()
        test_results["tests"]["embedding_generation"] = embedding_test
        
        # Test 3: Index Content Check
        logger.info("\n" + "="*50)
        logger.info("TEST 3: Index Content Check")
        logger.info("="*50)
        content_check = self.check_index_content()
        test_results["tests"]["index_content"] = content_check
        
        # Test 4: Vector Search (if vectors exist)
        if content_check.get("has_vectors", False):
            logger.info("\n" + "="*50)
            logger.info("TEST 4: Vector Search Functionality")
            logger.info("="*50)
            search_test = self.test_multiple_queries()
            test_results["tests"]["vector_search"] = search_test
        else:
            logger.warning("⚠️ No vectors found in index. Skipping vector search tests.")
            test_results["tests"]["vector_search"] = {
                "status": "skipped",
                "reason": "No vectors found in index"
            }
        
        # Summary
        logger.info("\n" + "="*50)
        logger.info("TEST SUMMARY")
        logger.info("="*50)
        
        connection_ok = connection_test["status"] == "connected"
        embeddings_ok = embedding_test["status"] == "success"
        has_vectors = content_check.get("has_vectors", False)
        
        if connection_ok and embeddings_ok and has_vectors:
            logger.info("🎉 ALL TESTS PASSED! Vector Search is working correctly.")
            test_results["overall_status"] = "PASSED"
        elif connection_ok and embeddings_ok:
            logger.warning("⚠️ Index connected and embeddings work, but no vectors found.")
            test_results["overall_status"] = "PARTIAL"
        else:
            logger.error("❌ CRITICAL TESTS FAILED. Vector Search is not working.")
            test_results["overall_status"] = "FAILED"
        
        return test_results

def main():
    """Main function to run the Vector Search tests"""
    
    # Load configuration from environment or config file
    PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "pocket-counsel")
    LOCATION = os.getenv("VERTEX_AI_LOCATION", "us-central1")
    INDEX_ID = os.getenv("VERTEX_AI_INDEX_ID", "849546455294148608")
    
    # Log configuration
    logger.info("🚀 Starting Pocket Counsel Vector Search Test Suite - FIXED VERSION")
    logger.info(f"📋 Configuration:")
    logger.info(f"   Project ID: {PROJECT_ID}")
    logger.info(f"   Location: {LOCATION}")
    logger.info(f"   Index ID: {INDEX_ID}")
    
    try:
        # Initialize tester
        tester = VectorSearchTester(PROJECT_ID, LOCATION, INDEX_ID)
        
        # Run comprehensive test
        results = tester.run_comprehensive_test()
        
        # Save results to file
        results_file = f"vector_search_test_results_fixed_{int(time.time())}.json"
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        logger.info(f"📄 Test results saved to: {results_file}")
        
        # Exit with appropriate code
        if results["overall_status"] == "PASSED":
            logger.info("✅ All tests passed! Vector Search is working correctly.")
            sys.exit(0)
        elif results["overall_status"] == "PARTIAL":
            logger.warning("⚠️ Partial success. Check results for details.")
            sys.exit(1)
        else:
            logger.error("❌ Tests failed. Check results for details.")
            sys.exit(1)
        
    except Exception as e:
        logger.error(f"❌ Test suite failed: {str(e)}")
        logger.error(f"❌ Error type: {type(e).__name__}")
        sys.exit(1)

if __name__ == "__main__":
    main()
