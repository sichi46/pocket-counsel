// apps/web/src/components/RAGChat.tsx
import React, { useState } from 'react';
import { trpc } from '../lib/trpc';

interface Source {
  source?: string;
  documentName?: string;
  title?: string;
  content?: string;
  similarity?: number;
  score?: number;
}

interface RAGResponse {
  answer: string;
  sources: Source[];
  confidence?: number;
}

export const RAGChat: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{
    question: string;
    response: RAGResponse;
    timestamp: Date;
  }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await trpc.askQuestion.query({
        question: question.trim(),
        topK: 3,
      });

      if (result && result.answer) {
        const ragResponse: RAGResponse = {
          answer: result.answer,
          sources: result.sources || [],
          confidence: result.confidence,
        };

        setChatHistory(prev => [...prev, {
          question: question.trim(),
          response: ragResponse,
          timestamp: new Date(),
        }]);
      } else {
        setError('No response received from the AI');
      }
    } catch (err) {
      console.error('Error asking question:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing your question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setError(null);
  };

  // Helper function to get the best document name
  const getDocumentName = (source: Source): string => {
    return source.title || source.documentName || source.source || 'Unknown Document';
  };

  // Helper function to format similarity score
  const formatSimilarity = (source: Source): string => {
    const score = source.similarity || source.score || 0;
    if (score > 100) {
      return `${(score / 10).toFixed(1)}% match`;
    }
    return `${score.toFixed(1)}% match`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🤖 Pocket Counsel RAG
        </h1>
        <p className="text-gray-600">
          Ask questions about Zambian law and get AI-powered answers with source citations
        </p>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Chat History */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">💬</div>
              <p>Start by asking a question about Zambian law</p>
              <p className="text-sm mt-2">Try: "What are the rights of children under Zambian law?"</p>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div key={index} className="space-y-3">
                {/* Question */}
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                    <p className="text-sm">{chat.question}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {chat.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Answer */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-xs lg:max-w-2xl">
                    <p className="text-sm text-gray-800 mb-2">{chat.response.answer}</p>
                    
                    {/* Sources */}
                    {chat.response.sources && chat.response.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          📚 Sources ({chat.response.sources.length}):
                        </p>
                        <div className="space-y-2">
                          {chat.response.sources.map((source, sourceIndex) => (
                            <div key={sourceIndex} className="text-xs">
                              <div className="font-medium text-gray-700">
                                {sourceIndex + 1}. {getDocumentName(source)}
                              </div>
                              {source.content && (
                                <div className="text-gray-500 mt-1 italic">
                                  "{source.content}"
                                </div>
                              )}
                              <div className="text-gray-400 mt-1">
                                {formatSimilarity(source)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Confidence */}
                    {chat.response.confidence && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          🎯 Confidence: {(chat.response.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex justify-start">
              <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg px-4 py-3 max-w-xs lg:max-w-md">
                <p className="text-sm">❌ {error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about Zambian law..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Ask'}
            </button>
            {chatHistory.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Quick Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            "What are the rights of children under Zambian law?",
            "What does the Employment Code Act regulate?",
            "What does the Companies Act govern?",
            "What are the main provisions of the Penal Code?",
            "What does the Lands Act regulate?",
            "What are the requirements for company registration?"
          ].map((quickQuestion, index) => (
            <button
              key={index}
              onClick={() => setQuestion(quickQuestion)}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
            >
              {quickQuestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
