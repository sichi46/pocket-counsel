// Inside src/components/ChatInterface.tsx

import React, { useState, useRef, useEffect } from 'react';

// Directly use the external image URL
const logoUrl = "https://i.ibb.co/xqJYpypz/Whats-App-Image-2025-08-07-at-01-17-33-24dc3c83.jpg";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    content: string;
    relevance: string;
    distance: string;
    searchType?: string;
    keywordMatches?: number;
  }>;
  metadata?: {
    documentsRetrieved: number;
    averageRelevance: number;
    embeddingDimensions: number;
    modelUsed: string;
    vectorSearchIndex: string;
    endpointId: string;
    note: string;
    processingTime: number;
  };
  error?: string;
}

interface APIResponse {
  answer: string;
  sources: Array<{
    title: string;
    content: string;
    relevance: string;
    distance: string;
    searchType?: string;
    keywordMatches?: number;
  }>;
  query: string;
  timestamp: string;
  processingTime: number;
  status: string;
  metadata: {
    documentsRetrieved: number;
    averageRelevance: number;
    embeddingDimensions: number;
    modelUsed: string;
    vectorSearchIndex: string;
    endpointId: string;
    note: string;
    processingTime: number;
  };
}

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [legalAreas] = useState([
    'Business Law: Companies Act, Registration of Business Names Act',
    'Employment Law: Employment Code Act, Workers\' Compensation Act',
    'Property Law: Lands and Deeds Registry Act, Intestate Succession Act',
    'Criminal Law: Criminal Procedure Code Act, Penal Code Act',
    'Family Law: Children\'s Code, Constitutional rights',
    'Financial Law: Banking and Financial Services Act',
    'Intellectual Property: Copyright and Performance Rights Act'
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_BASE_URL = 'https://api-6otymacelq-uc.a.run.app';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Preload background image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBackgroundLoaded(true);
    img.onerror = () => {
      console.warn('Background image failed to load, using fallback');
      setBackgroundLoaded(true); // Still set to true to remove loading state
    };
    img.src = logoUrl;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: inputValue.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data: APIResponse = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources,
        metadata: {
          ...data.metadata,
          processingTime: data.processingTime,
        },
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I apologize, but I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support if the issue persists.`,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatProcessingTime = (time: number) => {
    return `${(time / 1000).toFixed(1)}s`;
  };

  return (
    <div 
      className={`h-screen flex flex-col relative transition-opacity duration-1000 ${
        backgroundLoaded ? 'bg-image-container' : 'bg-[#eee9e7]'
      }`}
      style={{
        '--bg-image-url': `url(${logoUrl})`
      } as React.CSSProperties}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-overlay"></div>
      
      {/* Background loading indicator */}
      {!backgroundLoaded && (
        <div className="absolute inset-0 bg-[#eee9e7] flex items-center justify-center">
          <div className="text-[#6B4423] text-sm">Loading background...</div>
        </div>
      )}
      
      {/* Content container with relative positioning */}
      <div className="relative z-10 flex flex-col h-full">
      {/* Header with the new logo and title */}
      <header className="bg-[#a1745b] text-[#F5F5DC] p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img src={logoUrl} alt="Pocket Counsel Logo" className="h-10 w-10 mr-4 rounded-full" />
          <h1 className="text-2xl font-bold">Pocket Counsel RAG</h1>
        </div>
        <div className="text-sm text-[#F5F5DC]/70">
          Powered by Vertex AI & Gemini
        </div>
      </header>

      {/* Legal Areas Panel */}
      <div className="bg-[#8f795e] p-3 text-[#F5F5DC] text-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold">📚 Legal Areas Available:</span>
          <span className="bg-[#9c6b43] px-2 py-1 rounded text-xs">3,913 vectors</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {legalAreas.map((area, index) => (
            <span key={index} className="bg-[#6B4423] px-2 py-1 rounded text-xs">
              {area}
            </span>
          ))}
        </div>
      </div>
      
      {/* Main chat area */}
      <main className="flex-1 overflow-y-auto p-4 chat-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#4A3428] welcome-text-container">
            <div className="text-6xl mb-4">⚖️</div>
            <div className="text-xl font-semibold mb-2 text-[#6B4423] bg-[#F5F5DC]/90 px-4 py-2 rounded-lg shadow-lg border border-[#6B4423]/20">Welcome to Pocket Counsel</div>
            <div className="text-center max-w-md text-[#4A3428] bg-[#F5F5DC]/80 px-6 py-4 rounded-lg shadow-md border border-[#4A3428]/20">
              Your AI-powered legal assistant for Zambian law. Ask me anything about business law, employment, property, criminal law, family law, and more.
            </div>
            <div className="mt-6 text-sm text-[#6B4423] bg-[#F5F5DC]/90 px-3 py-2 rounded-lg shadow-sm border border-[#6B4423]/20">
              Try: "What are the minimum wage requirements in Zambia?"
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-4xl rounded-lg p-4 ${
                  message.type === 'user' 
                    ? 'bg-[#6B4423] text-[#F5F5DC]' 
                    : 'bg-[#8B7355] text-[#F5F5DC]'
                }`}>
                  <div className="flex items-start space-x-2">
                    <div className="text-2xl">
                      {message.type === 'user' ? '👤' : '⚖️'}
                    </div>
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {/* Enhanced Sources Display */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#F5F5DC]/20">
                          <div className="text-xs font-semibold mb-2">📄 Sources ({message.sources.length} documents):</div>
                          <div className="space-y-2">
                            {message.sources.map((source, index) => (
                              <div key={index} className="bg-[#6B4423]/50 p-2 rounded text-xs">
                                <div className="font-medium">{source.title}</div>
                                <div className="text-[#F5F5DC]/80">{source.content}</div>
                                <div className="text-[#F5F5DC]/60 mt-1 flex justify-between">
                                  <span>Relevance: {source.relevance}</span>
                                  <span>Distance: {source.distance}</span>
                                  {source.searchType && <span>Type: {source.searchType}</span>}
                                  {source.keywordMatches && <span>Keywords: {source.keywordMatches}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Metadata Display */}
                      {message.metadata && (
                        <div className="mt-3 pt-3 border-t border-[#F5F5DC]/20">
                          <div className="text-xs font-semibold mb-2">🔧 System Info:</div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-[#F5F5DC]/70">
                            <div>Documents: {message.metadata.documentsRetrieved}</div>
                            <div>Avg Relevance: {message.metadata.averageRelevance.toFixed(3)}</div>
                            <div>Embeddings: {message.metadata.embeddingDimensions}D</div>
                            <div>Model: {message.metadata.modelUsed}</div>
                            <div>Processing: {formatProcessingTime(message.metadata.processingTime)}</div>
                            <div>Index: {message.metadata.vectorSearchIndex.slice(0, 20)}...</div>
                          </div>
                          {message.metadata.note && (
                            <div className="text-xs text-[#F5F5DC]/60 mt-1 italic">
                              {message.metadata.note}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Error Display */}
                      {message.error && (
                        <div className="mt-3 pt-3 border-t border-red-400/30">
                          <div className="text-xs font-semibold mb-2 text-red-400">❌ Error Details:</div>
                          <div className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                            {message.error}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-[#F5F5DC]/50 mt-2">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#8B7355] text-[#F5F5DC] rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">⚖️</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#F5F5DC] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#F5F5DC] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-[#F5F5DC] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">Analyzing legal documents with Vertex AI...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input area */}
      <div className="bg-[#4A3428] p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about Zambian law..." 
            className="flex-1 p-3 rounded-lg bg-[#5C4033] text-[#F5F5DC] placeholder-[#F5F5DC]/50 border border-[#8B7355] focus:outline-none focus:border-[#6B4423] focus:ring-2 focus:ring-[#6B4423]/20"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !inputValue.trim()}
            className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
        <div className="text-xs text-[#F5F5DC]/50 mt-2 text-center">
          Your queries are processed using Vertex AI Vector Search and Gemini AI
        </div>
      </div>
      </div>
    </div>
  );
}

export default ChatInterface;