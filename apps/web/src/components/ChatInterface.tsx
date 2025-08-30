import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // TODO: Replace with actual API call to your vector search backend
    // For now, we'll simulate a response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to help you with Zambian legal questions. Please ask me anything about Zambian law, and I'll search through the legal documents to provide you with accurate information.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-[#5C4033]">
      {/* Header */}
      <header className="bg-[#4A3428] shadow-lg px-6 py-4">
        <div className="flex items-center space-x-3">
          <img src="/logo.svg" alt="Pocket Counsel Logo" className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold text-[#F5F5DC]">Pocket Counsel</h1>
            <p className="text-sm text-[#D2B48C]">AI-powered Zambian Legal Assistant</p>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 chat-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-[#8B7355] rounded-full flex items-center justify-center">
              <img src="/logo.svg" alt="Logo" className="w-16 h-16" />
            </div>
            <h2 className="text-2xl font-semibold text-[#F5F5DC] mb-2">
              Welcome to Pocket Counsel
            </h2>
            <p className="text-[#D2B48C] max-w-md mx-auto mb-8">
              Your AI-powered guide to Zambian law. Ask me any legal question and I'll search through our comprehensive legal database to provide you with accurate information.
            </p>
            
            {/* Legal Areas Panel */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#4A3428] rounded-lg p-6 border border-[#6B4423]">
                <h3 className="text-lg font-semibold text-[#F5F5DC] mb-4 text-center">
                  📚 Legal Areas Available
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-[#6B4423] rounded-lg p-4 border border-[#8B7355]">
                    <h4 className="font-medium text-[#F5F5DC] mb-2">🏢 Business Law</h4>
                    <ul className="text-sm text-[#D2B48C] space-y-1">
                      <li>• Companies Act</li>
                      <li>• Registration of Business Names Act</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#6B4423] rounded-lg p-4 border border-[#8B7355]">
                    <h4 className="font-medium text-[#F5F5DC] mb-2">👷 Employment Law</h4>
                    <ul className="text-sm text-[#D2B48C] space-y-1">
                      <li>• Employment Code Act</li>
                      <li>• Workers' Compensation Act</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#6B4423] rounded-lg p-4 border border-[#8B7355]">
                    <h4 className="font-medium text-[#F5F5DC] mb-2">🏠 Property Law</h4>
                    <ul className="text-sm text-[#D2B48C] space-y-1">
                      <li>• Lands and Deeds Registry Act</li>
                      <li>• Intestate Succession Act</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#6B4423] rounded-lg p-4 border border-[#8B7355]">
                    <h4 className="font-medium text-[#F5F5DC] mb-2">⚖️ Criminal Law</h4>
                    <ul className="text-sm text-[#D2B48C] space-y-1">
                      <li>• Criminal Procedure Code Act</li>
                      <li>• Penal Code Act</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#6B4423] rounded-lg p-4 border border-[#8B7355]">
                    <h4 className="font-medium text-[#F5F5DC] mb-2">👨‍👩‍👧‍👦 Family Law</h4>
                    <ul className="text-sm text-[#D2B48C] space-y-1">
                      <li>• Children's Code</li>
                      <li>• Constitutional rights</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#6B4423] rounded-lg p-4 border border-[#8B7355]">
                    <h4 className="font-medium text-[#F5F5DC] mb-2">💰 Financial Law</h4>
                    <ul className="text-sm text-[#D2B48C] space-y-1">
                      <li>• Banking and Financial Services Act</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#6B4423] rounded-lg p-4 border border-[#8B7355]">
                    <h4 className="font-medium text-[#F5F5DC] mb-2">🧠 Intellectual Property</h4>
                    <ul className="text-sm text-[#D2B48C] space-y-1">
                      <li>• Copyright and Performance Rights Act</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-[#CD853F]">
                    💡 <span className="font-medium">3,913 legal document vectors</span> available for instant search
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl px-4 py-3 rounded-lg ${
                message.isUser
                  ? 'bg-[#8B7355] text-[#F5F5DC]'
                  : 'bg-[#6B4423] text-[#F5F5DC]'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-2 ${
                message.isUser ? 'text-[#D2B48C]' : 'text-[#CD853F]'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#6B4423] text-[#F5F5DC] px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#D2B48C] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#D2B48C] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#D2B48C] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">Searching legal documents...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-[#4A3428] px-6 py-4 border-t border-[#6B4423]">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about Zambian law..."
            className="flex-1 px-4 py-3 bg-[#6B4423] text-[#F5F5DC] placeholder-[#CD853F] rounded-lg border border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-[#8B7355] text-[#F5F5DC] font-medium rounded-lg hover:bg-[#6B4423] focus:outline-none focus:ring-2 focus:ring-[#D2B48C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
