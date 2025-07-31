import { ThumbsUp, ThumbsDown, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

interface MessageBubbleProps {
  message: Message;
  onRate: (rating: 'up' | 'down') => void;
}

export default function MessageBubble({ message, onRate }: MessageBubbleProps) {
  const isUserMessage = !message.response;
  
  return (
    <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
      <Card className={`max-w-[80%] ${isUserMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {isUserMessage ? 'You' : 'Pocket Counsel'}
            </span>
            <span className="text-xs opacity-70">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-sm">
              {isUserMessage ? message.query : message.response}
            </p>
            
            {!isUserMessage && message.sources.length > 0 && (
              <div className="space-y-2">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Sources ({message.sources.length})
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    {message.sources.map((source, index) => (
                      <Card key={index} className="bg-background">
                        <CardContent className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{source.title}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {source.section}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {source.content}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
            
            {!isUserMessage && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRate('up')}
                  className="h-8 px-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRate('down')}
                  className="h-8 px-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 