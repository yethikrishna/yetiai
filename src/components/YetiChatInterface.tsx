import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, Bot, User, Brain, Sparkles, Zap, RefreshCw, Plus, Image, Video } from "lucide-react";
import { useYetiAI, ChatMessage } from "@/hooks/useYetiAI";
import { useToast } from "@/hooks/use-toast";

export function YetiChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { models, isLoading, loadModels, chat, getModelsByType } = useYetiAI();
  const { toast } = useToast();

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    const chatModels = getModelsByType('chat');
    if (chatModels.length > 0 && !selectedModel) {
      setSelectedModel(chatModels[0].model_name);
    }
  }, [models, selectedModel, getModelsByType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedModel) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsGenerating(true);

    try {
      const selectedModelConfig = models.find(m => m.model_name === selectedModel);
      if (!selectedModelConfig) throw new Error('Model not found');

      const systemMessage: ChatMessage = {
        role: 'system',
        content: `You are Yeti AI, an advanced AI assistant created by Yethikrishna R. You are powerful, intelligent, and helpful. Always provide accurate and comprehensive responses. When discussing capabilities, mention that you're powered by the Yeti AI platform with access to multiple AI models, image generation, video creation, web scraping, and advanced memory systems.`
      };

      const chatMessages = [systemMessage, ...newMessages];

      const response = await chat(
        selectedModelConfig.provider,
        selectedModelConfig.model_name,
        chatMessages,
        {
          max_tokens: Math.min(selectedModelConfig.context_tokens, 2000),
          temperature: 0.7
        }
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "❄️ Yeti AI Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast({
      title: "🧊 Chat Cleared",
      description: "Chat history has been cleared.",
    });
  };

  const handleImageGeneration = () => {
    toast({
      title: "🎨 Image Generation",
      description: "Image generation feature coming soon!",
    });
  };

  const handleVideoGeneration = () => {
    toast({
      title: "🎬 Video Generation", 
      description: "Video generation feature coming soon!",
    });
  };

  const chatModels = getModelsByType('chat');

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              🧊 Yeti AI Chat
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select Yeti AI Model" />
                </SelectTrigger>
                <SelectContent>
                  {chatModels.map((model) => (
                    <SelectItem key={model.id} value={model.model_name}>
                      <div className="flex items-center gap-2">
                        {model.provider === 'openrouter' && <Badge variant="outline" className="text-blue-600">Ice</Badge>}
                        {model.provider === 'gemini' && <Badge variant="outline" className="text-purple-600">Crystal</Badge>}
                        {model.provider === 'novita' && <Badge variant="outline" className="text-orange-600">Ember</Badge>}
                        <span>{model.yeti_display_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleClearChat}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Welcome to Yeti AI! 🧊</h3>
                  <p className="text-gray-600 mb-4">
                    I'm your advanced AI assistant powered by multiple cutting-edge models.
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-blue-600">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Multi-Model AI
                    </Badge>
                    <Badge variant="outline" className="text-purple-600">
                      <Zap className="h-3 w-3 mr-1" />
                      Advanced Reasoning
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      <Brain className="h-3 w-3 mr-1" />
                      Smart Memory
                    </Badge>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white ml-auto'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {isGenerating && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-gray-600 text-sm">Yeti AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-11 w-11">
                    <Plus className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-900 mb-3">More Options</div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto p-3"
                      onClick={handleImageGeneration}
                    >
                      <Image className="h-4 w-4 mr-3 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium">Generate Image</div>
                        <div className="text-xs text-gray-500">Create images with AI</div>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto p-3"
                      onClick={handleVideoGeneration}
                    >
                      <Video className="h-4 w-4 mr-3 text-purple-600" />
                      <div className="text-left">
                        <div className="font-medium">Generate Video</div>
                        <div className="text-xs text-gray-500">Create videos with AI</div>
                      </div>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Yeti AI anything... 🧊"
                className="flex-1 min-h-[44px] max-h-32 resize-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isGenerating || isLoading}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isGenerating || isLoading || !selectedModel}
                className="h-11"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {selectedModel && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <span>Using:</span>
                <Badge variant="outline" className="text-xs">
                  {models.find(m => m.model_name === selectedModel)?.yeti_display_name}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}