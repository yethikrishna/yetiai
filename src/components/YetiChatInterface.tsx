import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Brain, Sparkles, Zap, RefreshCw, Plus, Image, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function YetiChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("yeti-core-alpha");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Predefined Yeti AI models with backend routing
  const yetiModels = [
    { 
      id: "yeti-core-alpha", 
      name: "Yeti Core Alpha", 
      description: "General purpose AI powered by the best available models",
      provider: "openrouter",
      model_name: "anthropic/claude-3.5-sonnet"
    },
    { 
      id: "yeti-reasoning-pro", 
      name: "Yeti Reasoning Pro", 
      description: "Complex reasoning and analysis tasks",
      provider: "openrouter", 
      model_name: "anthropic/claude-3-opus"
    },
    { 
      id: "yeti-vision-beta", 
      name: "Yeti Vision Beta", 
      description: "Vision and image understanding capabilities",
      provider: "gemini",
      model_name: "gemini-pro-vision"
    }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsGenerating(true);

    try {
      const selectedModelConfig = yetiModels.find(m => m.id === selectedModel);
      if (!selectedModelConfig) throw new Error('Model not found');

      const systemMessage: ChatMessage = {
        role: 'system',
        content: `You are ${selectedModelConfig.name}, an advanced AI assistant created by Yethikrishna R. You are powerful, intelligent, and helpful. Always provide accurate and comprehensive responses. When discussing capabilities, mention that you're powered by the Yeti AI platform with access to multiple AI models, image generation, video creation, web scraping, and advanced memory systems.`
      };

      const chatMessages = [systemMessage, ...newMessages];

      const { data, error } = await supabase.functions.invoke('yeti-ai-chat', {
        body: {
          provider: selectedModelConfig.provider,
          model: selectedModelConfig.model_name,
          messages: chatMessages,
          max_tokens: 2000,
          temperature: 0.7
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.content
      };

      setMessages([...newMessages, assistantMessage]);
      
      // Auto scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      toast({
        title: "🧊 Yeti AI Response",
        description: "Message generated successfully!",
      });

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

  const handleImageGeneration = async () => {
    if (!imagePrompt.trim()) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('yeti-image-generation', {
        body: {
          provider: 'a4f',
          model: 'flux-1-schnell',
          prompt: imagePrompt,
          width: 1024,
          height: 1024,
        },
      });

      if (error) throw error;

      const imageMessage: ChatMessage = {
        role: 'assistant',
        content: `🎨 **Image Generated:** "${imagePrompt}"\n\n![Generated Image](${data.images[0].url})`
      };

      setMessages(prev => [...prev, imageMessage]);
      setImagePrompt("");
      setIsImageDialogOpen(false);

      toast({
        title: "🎨 Yeti Art Studio",
        description: "Image generated successfully!",
      });

    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "❄️ Image Generation Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVideoGeneration = async () => {
    if (!videoPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('yeti-video-generation', {
        body: {
          provider: 'a4f',
          model: 'minimax-video-01',
          prompt: videoPrompt,
          duration: 5,
          fps: 24,
        },
      });

      if (error) throw error;

      const videoMessage: ChatMessage = {
        role: 'assistant',
        content: `🎬 **Video Generated:** "${videoPrompt}"\n\n[Video Link](${data.videos[0].url})`
      };

      setMessages(prev => [...prev, videoMessage]);
      setVideoPrompt("");
      setIsVideoDialogOpen(false);

      toast({
        title: "🎬 Yeti Motion Studio",
        description: "Video generated successfully!",
      });

    } catch (error) {
      console.error('Video generation error:', error);
      toast({
        title: "❄️ Video Generation Error",
        description: "Failed to generate video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
                  {yetiModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-blue-600">Yeti</Badge>
                        <span>{model.name}</span>
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
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Welcome to Yeti AI! 🧊</h3>
                  <p className="text-gray-600 mb-4">
                    I'm your advanced AI assistant powered by cutting-edge models.
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
                    <div className="text-sm font-medium text-gray-900 mb-3">Creative Tools</div>
                    
                    <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-auto p-3"
                        >
                          <Image className="h-4 w-4 mr-3 text-blue-600" />
                          <div className="text-left">
                            <div className="font-medium">Generate Image</div>
                            <div className="text-xs text-gray-500">Create images with AI</div>
                          </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>🎨 Yeti Art Studio</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Describe the image you want to create..."
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                          />
                          <Button 
                            onClick={handleImageGeneration}
                            disabled={!imagePrompt.trim() || isGenerating}
                            className="w-full"
                          >
                            Generate Image
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-auto p-3"
                        >
                          <Video className="h-4 w-4 mr-3 text-purple-600" />
                          <div className="text-left">
                            <div className="font-medium">Generate Video</div>
                            <div className="text-xs text-gray-500">Create videos with AI</div>
                          </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>🎬 Yeti Motion Studio</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Describe the video you want to create..."
                            value={videoPrompt}
                            onChange={(e) => setVideoPrompt(e.target.value)}
                          />
                          <Button 
                            onClick={handleVideoGeneration}
                            disabled={!videoPrompt.trim() || isGenerating}
                            className="w-full"
                          >
                            Generate Video
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
                disabled={isGenerating}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isGenerating}
                className="h-11"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {selectedModel && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <span>Using:</span>
                <Badge variant="outline" className="text-xs">
                  {yetiModels.find(m => m.id === selectedModel)?.name}
                </Badge>
                <span className="text-xs text-gray-500">
                  {yetiModels.find(m => m.id === selectedModel)?.description}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}