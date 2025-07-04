import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Brain, Sparkles, Zap, RefreshCw, Plus, Image, Video, History, Save, Menu, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { VoiceInput } from "@/components/VoiceInput";
import { VoiceControls } from "@/components/VoiceControls";
import { useVoiceOutput } from "@/hooks/useVoiceOutput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useYetiChatMemory, ChatMessage } from "@/hooks/useYetiChatMemory";
import { YetiChatHistory } from "@/components/YetiChatHistory";

interface LocalChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function YetiChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("yeti-core-alpha");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Voice system integration
  const { 
    generateSpeech, 
    isGenerating: isVoiceGenerating, 
    isPlaying, 
    stopAudio,
    voiceSettings,
    updateVoiceSettings 
  } = useVoiceOutput();

  // Memory system integration
  const {
    messages,
    setMessages,
    currentSession,
    saveMessage,
    loadSession,
    startNewSession
  } = useYetiChatMemory();

  // Predefined Yeti AI models with backend routing and fallback
  const yetiModels = [
    { 
      id: "yeti-core-alpha", 
      name: "Yeti Core Alpha", 
      description: "GPT-4o with multi-provider fallback",
      provider: "openai",
      model_name: "gpt-4o"
    },
    { 
      id: "yeti-claude-sonnet", 
      name: "Yeti Claude Sonnet", 
      description: "Claude 3.5 Sonnet with OpenAI fallback",
      provider: "openrouter",
      model_name: "anthropic/claude-3.5-sonnet"
    },
    { 
      id: "yeti-gemini-flash", 
      name: "Yeti Gemini Flash", 
      description: "Gemini 1.5 Flash with multi-provider fallback",
      provider: "gemini",
      model_name: "gemini-1.5-flash"
    },
    { 
      id: "yeti-claude-opus", 
      name: "Yeti Claude Opus", 
      description: "Claude 3 Opus via OpenRouter",
      provider: "openrouter",
      model_name: "anthropic/claude-3-opus"
    },
    { 
      id: "yeti-gpt-4o-mini", 
      name: "Yeti GPT-4o Mini", 
      description: "Fast and efficient GPT-4o Mini",
      provider: "openai",
      model_name: "gpt-4o-mini"
    },
    { 
      id: "yeti-llama-3-70b", 
      name: "Yeti Llama 3 70B", 
      description: "Meta Llama 3 70B via OpenRouter",
      provider: "openrouter",
      model_name: "meta-llama/llama-3.1-70b-instruct"
    },
    { 
      id: "yeti-novita-llama", 
      name: "Yeti Novita Llama", 
      description: "Llama 3.1 8B via Novita with fallbacks",
      provider: "novita",
      model_name: "meta-llama/llama-3.1-8b-instruct"
    }
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    console.log('🧊 Yeti Chat: Starting message send process');
    
    let sessionId = currentSession;
    
    // Create new session if none exists
    if (!sessionId) {
      console.log('🧊 Yeti Chat: Creating new session');
      sessionId = await startNewSession(selectedModel);
      if (!sessionId) {
        console.error('❄️ Yeti Chat: Failed to create session');
        return;
      }
      console.log('🧊 Yeti Chat: Session created:', sessionId);
    }

    const userMessageContent = inputMessage.trim();
    setInputMessage("");
    setIsGenerating(true);

    console.log('🧊 Yeti Chat: Saving user message to memory');
    // Save user message to memory first to get the full message object
    const savedUser = await saveMessage(sessionId, 'user', userMessageContent);
    if (!savedUser) {
      console.error('❄️ Yeti Chat: Failed to save user message');
      return;
    }

    try {
      const selectedModelConfig = yetiModels.find(m => m.id === selectedModel);
      if (!selectedModelConfig) throw new Error('Model not found');

      console.log('🧊 Yeti Chat: Selected model config:', selectedModelConfig);

      const systemMessage: LocalChatMessage = {
        role: 'system',
        content: `You are ${selectedModelConfig.name}, an advanced AI assistant created by Yethikrishna R. You are powerful, intelligent, and helpful. Always provide accurate and comprehensive responses. When discussing capabilities, mention that you're powered by the Yeti AI platform with access to multiple AI models, image generation, video creation, web scraping, and advanced memory systems.`
      };

      // Convert messages for API call
      const chatMessages = [systemMessage, ...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMessageContent }];

      console.log('🧊 Yeti Chat: Calling AI service with:', {
        provider: selectedModelConfig.provider,
        model: selectedModelConfig.model_name,
        messageCount: chatMessages.length
      });

      const { data, error } = await supabase.functions.invoke('yeti-ai-chat', {
        body: {
          provider: selectedModelConfig.provider,
          model: selectedModelConfig.model_name,
          messages: chatMessages,
          max_tokens: 2000,
          temperature: 0.7
        },
      });

      if (error) {
        console.error('❄️ Yeti Chat: API Error details:', error);
        console.error('❄️ Yeti Chat: Error message:', error.message);
        console.error('❄️ Yeti Chat: Error code:', error.code);
        throw new Error(`API Error: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        console.error('❄️ Yeti Chat: No data received from API');
        throw new Error('No response data received from AI service');
      }

      if (!data.content) {
        console.error('❄️ Yeti Chat: Invalid response format:', data);
        throw new Error('Invalid response format - missing content');
      }

      console.log('🧊 Yeti Chat: API Response received successfully:', data.content.substring(0, 100) + '...');

      // Save assistant message to memory (this will trigger a reload of messages)
      await saveMessage(sessionId, 'assistant', data.content);

      // Generate voice output if enabled
      if (isVoiceEnabled && data.content) {
        await generateSpeech(data.content);
      }

      toast({
        title: "🧊 Yeti AI Response",
        description: "Message generated and saved to memory!",
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

  const handleNewSession = async () => {
    const sessionId = await startNewSession(selectedModel);
    if (sessionId) {
      toast({
        title: "🧊 New Session",
        description: "Started a fresh conversation!",
      });
    }
  };

  const handleSessionSelect = async (sessionId: string) => {
    await loadSession(sessionId);
    setShowHistory(false); // Hide history on mobile after selection
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInputMessage(inputMessage + (inputMessage ? ' ' : '') + transcript);
  };

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  const handleClearCurrentSession = () => {
    setMessages([]);
    toast({
      title: "🧊 Chat Cleared",
      description: "Current session cleared (still saved in memory).",
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

      const imageContent = `🎨 **Image Generated:** "${imagePrompt}"\n\n![Generated Image](${data.images[0].url})`;
      
      // Save to memory if we have a session
      if (currentSession) {
        await saveMessage(currentSession, 'assistant', imageContent);
      }

      setImagePrompt("");
      setIsImageDialogOpen(false);

      toast({
        title: "🎨 Yeti Art Studio",
        description: "Image generated and saved to memory!",
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

      const videoContent = `🎬 **Video Generated:** "${videoPrompt}"\n\n[Video Link](${data.videos[0].url})`;

      // Save to memory if we have a session
      if (currentSession) {
        await saveMessage(currentSession, 'assistant', videoContent);
      }

      setVideoPrompt("");
      setIsVideoDialogOpen(false);

      toast({
        title: "🎬 Yeti Motion Studio",
        description: "Video generated and saved to memory!",
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
    <div className="flex h-[600px] max-w-7xl mx-auto gap-2">
      {/* Chat History Sidebar - Desktop */}
      <div className={`hidden lg:block w-80 ${showHistory ? 'block' : 'hidden'}`}>
        <YetiChatHistory
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
          currentSessionId={currentSession}
          className="h-full"
        />
      </div>

      {/* Mobile History Dialog */}
      <Dialog open={showHistory && window.innerWidth < 1024} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-md h-[80vh] p-0">
          <YetiChatHistory
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
            currentSessionId={currentSession}
            className="h-full"
          />
        </DialogContent>
      </Dialog>

      {/* Main Chat Interface */}
      <div className="flex-1">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="lg:hidden flex-shrink-0"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-sm sm:text-base truncate">🧊 Yeti AI Chat</span>
                {currentSession && (
                  <Badge variant="outline" className="text-xs hidden sm:flex">
                    <Save className="h-3 w-3 mr-1" />
                    Memory Active
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {currentSession && (
                  <Badge variant="outline" className="text-xs sm:hidden">
                    <Save className="h-3 w-3" />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="hidden lg:flex"
                >
                  <History className="h-4 w-4" />
                </Button>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-32 sm:w-48 text-xs sm:text-sm">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {yetiModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-blue-600 text-xs">Yeti</Badge>
                          <span className="text-xs sm:text-sm">{model.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleNewSession} className="hidden sm:flex">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearCurrentSession} className="hidden sm:flex">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="sm:hidden">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-1">
                      <Button variant="ghost" size="sm" onClick={handleNewSession} className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        New Session
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleClearCurrentSession} className="w-full justify-start">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Clear Chat
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
          
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 px-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">Welcome to Yeti AI! 🧊</h3>
                      <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                        I'm your advanced AI assistant with persistent memory.
                      </p>
                      <div className="flex justify-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-blue-600 text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Multi-Model AI
                        </Badge>
                        <Badge variant="outline" className="text-purple-600 text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Advanced Reasoning
                        </Badge>
                        <Badge variant="outline" className="text-green-600 text-xs">
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
                
                <VoiceInput 
                  onTranscript={handleVoiceTranscript}
                  disabled={isGenerating}
                />
                
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
              
              {/* Voice Controls */}
              <div className="mt-3">
                <VoiceControls
                  voiceSettings={voiceSettings}
                  onVoiceSettingsChange={updateVoiceSettings}
                  isVoiceEnabled={isVoiceEnabled}
                  onToggleVoice={toggleVoice}
                  isListening={false} // Add listening state if needed
                  isGenerating={isVoiceGenerating}
                  isPlaying={isPlaying}
                  onStopAudio={stopAudio}
                />
              </div>
              
              <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Using:</span>
                  <Badge variant="outline" className="text-xs">
                    {yetiModels.find(m => m.id === selectedModel)?.name}
                  </Badge>
                  {isVoiceEnabled && (
                    <Badge variant="outline" className="text-xs text-blue-600">
                      <Volume2 className="h-3 w-3 mr-1" />
                      Voice Active
                    </Badge>
                  )}
                </div>
                {currentSession && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Save className="h-3 w-3" />
                    Auto-saving to memory
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}