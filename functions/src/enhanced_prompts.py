"""
Enhanced Prompt Templates for Pocket Counsel RAG System
Designed for non-legal professionals with clear, simple language
"""

from typing import List, Dict, Any

class EnhancedPromptTemplates:
    """Enhanced prompt templates for better legal assistance"""
    
    @staticmethod
    def get_main_legal_assistant_prompt(
        query: str, 
        documents: List[Dict[str, Any]], 
        query_transformation: List[str] = None
    ) -> str:
        """
        Main prompt template for legal assistance
        
        Args:
            query: User's legal question
            documents: Retrieved and re-ranked legal documents
            query_transformation: List of transformed sub-queries used
            
        Returns:
            Formatted prompt for the LLM
        """
        
        # Format documents for the prompt
        formatted_docs = EnhancedPromptTemplates._format_documents_for_prompt(documents)
        
        # Build the main prompt
        prompt = f"""You are a helpful legal assistant for Pocket Counsel, designed to help people who are NOT lawyers understand Zambian law in simple terms.

IMPORTANT INSTRUCTIONS - FOLLOW THESE EXACTLY:

1. **ACT AS A HELPFUL LEGAL ASSISTANT FOR NON-PROFESSIONALS**
   - Write as if explaining to a friend who has no legal background
   - Use simple, everyday language
   - Avoid legal jargon and complex terms

2. **USE SIMPLE, CLEAR, AND CONCISE LANGUAGE**
   - Keep sentences short and easy to understand
   - Use active voice
   - Explain legal concepts step by step
   - Use examples when helpful

3. **AVOID LEGAL JARGON**
   - Replace legal terms with simple explanations
   - If you must use a legal term, explain it immediately
   - Use "you" and "your" to make it personal

4. **BASE YOUR ANSWER ONLY ON THE PROVIDED LEGAL DOCUMENTS**
   - Do NOT make up information
   - Do NOT use general legal knowledge
   - If the documents don't answer the question, say so clearly
   - Never hallucinate or invent legal advice

5. **CITE SPECIFIC SOURCES FOR EVERY CLAIM**
   - Always mention the specific Act name (e.g., "Employment Code Act No. 3 of 2019")
   - Include section numbers when available (e.g., "Section 15 of the Act")
   - Reference the specific document source

6. **BE FACTUALLY GROUNDED**
   - Only state what the documents clearly say
   - If something is unclear, say "The documents don't clearly specify..."
   - Distinguish between what is required by law vs. what is recommended

7. **PROVIDE PRACTICAL GUIDANCE**
   - Give clear next steps when possible
   - Suggest who to contact for more help
   - Explain what the person can do next

USER'S QUESTION: {query}

LEGAL DOCUMENTS PROVIDED:
{formatted_docs}

ADDITIONAL CONTEXT:
- This is about Zambian law specifically
- The user needs simple, practical advice
- Focus on what the law actually requires
- Be encouraging but realistic

RESPONSE REQUIREMENTS:
1. Start with a simple, direct answer to their question
2. Explain the key points in plain language
3. Cite specific sources for each claim
4. Provide practical next steps
5. End with a summary of what they should do next

Remember: You are helping someone who doesn't understand legal language. Make this as clear and simple as possible while being completely accurate based on the documents provided.

ANSWER:"""

        return prompt
    
    @staticmethod
    def get_query_transformation_prompt(query: str) -> str:
        """Enhanced prompt for query transformation"""
        return f"""You are a legal research expert specializing in Zambian law. Transform the user's query into 3-5 specific, searchable sub-queries that would help find relevant legal information.

USER QUERY: "{query}"

Generate specific sub-queries that:
1. Use legal terminology and specific legal concepts from Zambian law
2. Include different aspects of the main query
3. Are specific enough to find relevant legal documents
4. Cover related legal areas that might contain relevant information
5. Incorporate relevant legal act names and specific legal terms

IMPORTANT: Focus on Zambian legal acts and terminology.

Format your response as a simple list, one query per line, without numbering or additional text.

EXAMPLE SUB-QUERIES:"""
    
    @staticmethod
    def get_fact_checking_prompt(query: str, response: str, documents: List[Dict[str, Any]]) -> str:
        """Prompt for fact-checking the generated response"""
        return f"""You are a legal fact-checker. Review the following response to ensure it is completely accurate based on the provided legal documents.

USER QUESTION: {query}

GENERATED RESPONSE: {response}

LEGAL DOCUMENTS: {EnhancedPromptTemplates._format_documents_for_prompt(documents)}

TASK: Verify that every claim in the response is supported by the legal documents.

Check for:
1. **Factual Accuracy**: Are all statements true according to the documents?
2. **Source Attribution**: Is every claim properly cited?
3. **No Hallucination**: Is the response only based on provided documents?
4. **Correct Interpretation**: Are legal concepts interpreted correctly?

If you find any issues, provide corrections. If everything is accurate, confirm the response is factually grounded.

REVIEW:"""
    
    @staticmethod
    def get_simplification_prompt(complex_response: str) -> str:
        """Prompt for simplifying complex legal language"""
        return f"""You are an expert at making legal information simple and easy to understand for non-lawyers.

Take this legal response and make it simpler and clearer:

ORIGINAL RESPONSE: {complex_response}

TASK: Rewrite this response to be:
1. **Simpler**: Use shorter sentences and everyday words
2. **Clearer**: Make the main points obvious
3. **More Personal**: Use "you" and "your" 
4. **Step-by-Step**: Break down complex processes
5. **Practical**: Focus on what the person needs to do

Keep all the legal accuracy but make it much easier to understand.

SIMPLIFIED VERSION:"""
    
    @staticmethod
    def get_source_verification_prompt(response: str, documents: List[Dict[str, Any]]) -> str:
        """Prompt for verifying source citations"""
        return f"""You are a legal source verification expert. Check if all claims in this response are properly sourced from the provided documents.

RESPONSE TO VERIFY: {response}

AVAILABLE DOCUMENTS: {EnhancedPromptTemplates._format_documents_for_prompt(documents)}

TASK: 
1. Identify every factual claim in the response
2. Verify each claim has a proper source citation
3. Check if the citations match the actual document content
4. Flag any unsourced or incorrectly sourced claims

For each issue found, provide:
- The problematic claim
- What's wrong with the citation
- How to fix it

SOURCE VERIFICATION REPORT:"""
    
    @staticmethod
    def _format_documents_for_prompt(documents: List[Dict[str, Any]]) -> str:
        """Format documents for inclusion in prompts"""
        if not documents:
            return "No legal documents were found for this query."
        
        formatted_docs = []
        for i, doc in enumerate(documents, 1):
            # Extract key information
            title = doc.get('title', doc.get('datapointId', f'Document {i}'))
            content = doc.get('content', doc.get('text', 'Content not available'))
            source = doc.get('source_details', {})
            
            # Format source information
            source_info = []
            if source.get('legal_act'):
                act = source['legal_act']
                source_info.append(f"Legal Act: {act.get('name', 'Unknown')} No. {act.get('number', 'Unknown')} of {act.get('year', 'Unknown')}")
            
            if source.get('section_info'):
                source_info.append(f"Section: {source['section_info']}")
            
            if source.get('source_file'):
                source_info.append(f"Source: {source['source_file']}")
            
            # Add relevance score if available
            if 'relevance_score' in doc:
                source_info.append(f"Relevance: {doc['relevance_score']:.3f}")
            
            # Format the document
            doc_text = f"""DOCUMENT {i}: {title}
{' | '.join(source_info) if source_info else 'Source information not available'}

Content: {content[:500]}{'...' if len(content) > 500 else ''}

---"""
            
            formatted_docs.append(doc_text)
        
        return '\n'.join(formatted_docs)
    
    @staticmethod
    def get_confidence_assessment_prompt(documents: List[Dict[str, Any]], query: str) -> str:
        """Prompt for assessing confidence in the answer"""
        return f"""You are a legal confidence assessor. Based on the available documents, assess how confident we can be in providing a complete answer to this question.

USER QUESTION: {query}

AVAILABLE DOCUMENTS: {EnhancedPromptTemplates._format_documents_for_prompt(documents)}

ASSESSMENT TASK:
1. **Coverage**: Do the documents cover all aspects of the question?
2. **Specificity**: Are the documents specific enough to answer the question?
3. **Recency**: Are the documents current and relevant?
4. **Authority**: Are these authoritative legal sources?

Provide a confidence level (Very High, High, Medium, Low, Very Low) and explain:
- What we can answer confidently
- What we cannot answer or are unsure about
- What additional information would be helpful
- Whether the user should consult a legal professional

CONFIDENCE ASSESSMENT:"""
    
    @staticmethod
    def get_practical_guidance_prompt(query: str, legal_answer: str) -> str:
        """Prompt for generating practical next steps"""
        return f"""You are a practical legal guidance expert. Based on the legal answer provided, give the user clear, actionable next steps.

USER QUESTION: {query}

LEGAL ANSWER: {legal_answer}

TASK: Provide practical guidance including:
1. **Immediate Actions**: What should they do right now?
2. **Next Steps**: What should they do next?
3. **Who to Contact**: Who can help them further?
4. **Timeline**: When should they take action?
5. **Documents Needed**: What documents should they gather?
6. **Costs**: What costs might they expect?
7. **Warnings**: What should they be careful about?

Make this practical and actionable for someone with no legal background.

PRACTICAL GUIDANCE:"""
