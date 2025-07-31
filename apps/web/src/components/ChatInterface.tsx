import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  query: string;
  response: string;
  sources: Array<{
    title: string;
    section: string;
    content: string;
  }>;
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const askQuestionMutation = trpc.chat.askQuestion.useMutation({
    onSuccess: (data) => {
      const newMessage: Message = {
        id: data.messageId,
        query: data.answer, // This should be the original question
        response: data.answer,
        sources: data.sources,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
      setIsLoading(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  const handleSubmit = async (question: string) => {
    if (!question.trim()) return;

    setIsLoading(true);
    
    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      query: question,
      response: '',
      sources: [],
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      await askQuestionMutation.mutateAsync({ question });
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  return (
    <div className="chat-container">
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-center">
            Pocket Counsel - Zambian Legal Assistant
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>Ask me anything about Zambian law!</p>
                  <p className="text-sm mt-2">
                    I can help you understand legal concepts, find relevant laws, and provide guidance.
                  </p>
                </div>
              )}
              
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onRate={(rating) => {
                    // TODO: Implement rating functionality
                    console.log('Rating:', rating);
                  }}
                />
              ))}
              
              {isLoading && (
                <div className="flex justify-center">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="loading-dots">Thinking</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <ChatInput onSubmit={handleSubmit} disabled={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
} 