import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Send,
    Loader2,
    Bot,
    User,
    Sprout,
    Sparkles,
    HelpCircle
} from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface FarmContext {
    id: string;
    farm_name: string;
    crop: string;
    location: { state: string; lga?: string };
    current_growth_stage: string;
    planting_date: string;
    expected_harvest_date?: string;
    water_access: string;
}

interface FarmChatAssistantProps {
    farm?: FarmContext | null;
    className?: string;
}

const QUICK_QUESTIONS = [
    "Should I irrigate today?",
    "When should I apply fertilizer?",
    "What pests should I watch for?",
    "How much will I earn from this harvest?",
    "When is the best time to harvest?",
];

export const FarmChatAssistant: React.FC<FarmChatAssistantProps> = ({
    farm,
    className = ''
}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Add welcome message
        if (farm) {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: `Hello! I'm your farming assistant for ${farm.farm_name}. Your ${farm.crop} is currently in the ${farm.current_growth_stage} stage. How can I help you today?`,
                timestamp: new Date(),
            }]);
        } else {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: "Hello! I'm your farming assistant. Select a farm to get personalized advice, or ask me general farming questions!",
                timestamp: new Date(),
            }]);
        }
    }, [farm]);

    useEffect(() => {
        // Scroll to bottom when messages update
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (messageText: string = input) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Build context for AI
            let systemPrompt = `You are a helpful farming assistant for Nigerian farmers. 
Provide practical, actionable advice in simple language.
Focus on local conditions and affordable solutions.
Keep responses concise but helpful.`;

            let context = '';

            if (farm) {
                const daysSincePlanting = Math.floor(
                    (new Date().getTime() - new Date(farm.planting_date).getTime()) / (1000 * 60 * 60 * 24)
                );

                context = `
FARM CONTEXT:
- Farm: ${farm.farm_name}
- Crop: ${farm.crop}
- Location: ${farm.location.state}${farm.location.lga ? `, ${farm.location.lga}` : ''}
- Planted: ${farm.planting_date} (Day ${daysSincePlanting})
- Current Stage: ${farm.current_growth_stage}
- Expected Harvest: ${farm.expected_harvest_date || 'Not set'}
- Water: ${farm.water_access}

Answer the farmer's question using this context. Be specific to their situation.`;
            }

            const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

            // Use edge function for chat
            const { data, error } = await supabase.functions.invoke('chat-with-context', {
                body: {
                    message: messageText,
                    farm_id: farm?.id,
                    farm_context: farm ? context : null,
                },
            });

            if (error) throw error;

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response || "I'm sorry, I couldn't process your question. Please try again.",
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Save to chat history
            if (user && farm) {
                await supabase.from('chat_history').insert({
                    user_id: user.id,
                    farm_id: farm.id,
                    message: messageText,
                    response: assistantMessage.content,
                    farm_context: { farm },
                });
            }

        } catch (error) {
            console.error('Chat error:', error);

            // Fallback response
            const fallbackMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: farm
                    ? `I understand you're asking about "${messageText}" for your ${farm.crop} farm. While I'm having trouble connecting right now, I suggest checking the daily recommendations tab for current guidance based on your farm's conditions.`
                    : "I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, fallbackMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickQuestion = (question: string) => {
        sendMessage(question);
    };

    return (
        <Card className={`flex flex-col h-[500px] ${className}`}>
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    Farm Assistant
                    {farm && (
                        <span className="text-sm font-normal text-muted-foreground">
                            • {farm.farm_name}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                                >
                                    {message.role === 'assistant' && (
                                        <Avatar className="h-8 w-8 flex-shrink-0">
                                            <AvatarFallback className="bg-green-100 text-green-600">
                                                <Bot className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div className={`max-w-[80%] rounded-lg px-3 py-2 ${message.role === 'user'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-muted'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    </div>

                                    {message.role === 'user' && (
                                        <Avatar className="h-8 w-8 flex-shrink-0">
                                            <AvatarFallback className="bg-blue-100 text-blue-600">
                                                <User className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-3"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-green-100 text-green-600">
                                        <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-lg px-3 py-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-green-500" />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </ScrollArea>

                {/* Quick Questions */}
                {messages.length <= 1 && (
                    <div className="px-4 pb-2">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <HelpCircle className="h-3 w-3" />
                            Quick questions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_QUESTIONS.slice(0, 3).map((question) => (
                                <Button
                                    key={question}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={() => handleQuickQuestion(question)}
                                >
                                    {question}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendMessage();
                        }}
                        className="flex gap-2"
                    >
                        <Input
                            placeholder="Ask me anything about your farm..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
};

export default FarmChatAssistant;
