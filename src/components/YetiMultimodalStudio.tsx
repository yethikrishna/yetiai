import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Upload, 
  Image, 
  Video, 
  FileText, 
  Eye, 
  Brain, 
  Zap,
  Download,
  Play,
  Pause,
  MessageSquare,
  Camera,
  Headphones,
  FileAudio,
  RotateCcw
} from "lucide-react";

interface MediaResult {
  type: 'image' | 'video' | 'audio' | 'text' | 'analysis';
  content: string;
  metadata?: any;
  timestamp: string;
}

export function YetiMultimodalStudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<MediaResult[]>([]);
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [memories, setMemories] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const addResult = useCallback((result: MediaResult) => {
    setResults(prev => [result, ...prev]);
  }, []);

  const handleError = useCallback((error: string) => {
    console.error('Yeti Error:', error);
    toast({
      title: "❌ Yeti AI Error",
      description: error,
      variant: "destructive",
    });
  }, [toast]);

  const callMultimodalAPI = async (action: string, data: any) => {
    try {
      setIsProcessing(true);
      setProgress(20);

      const { data: response, error } = await supabase.functions.invoke('yeti-multimodal-ai', {
        body: { action, ...data }
      });

      setProgress(80);

      if (error) throw error;
      if (!response.success) throw new Error(response.error);

      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
      
      return response;
    } finally {
      setIsProcessing(false);
    }
  };

  const callMemoryAPI = async (action: string, data: any) => {
    const { data: response, error } = await supabase.functions.invoke('yeti-supermemory', {
      body: { action, userId: 'demo-user', ...data }
    });

    if (error) throw error;
    if (!response.success) throw new Error(response.error);
    
    return response;
  };

  const callFileAPI = async (action: string, data: any) => {
    const { data: response, error } = await supabase.functions.invoke('yeti-file-handler', {
      body: { action, userId: 'demo-user', ...data }
    });

    if (error) throw error;
    if (!response.success) throw new Error(response.error);
    
    return response;
  };

  // Image Generation
  const generateImage = async () => {
    if (!prompt.trim()) return;

    try {
      const response = await callMultimodalAPI('generate_image', {
        prompt,
        width: 1024,
        height: 1024,
        model: 'flux-1-schnell'
      });

      addResult({
        type: 'image',
        content: response.images[0].url,
        metadata: { prompt, model: 'flux-1-schnell' },
        timestamp: new Date().toISOString()
      });

      // Store in memory
      await callMemoryAPI('store_memory', {
        content: `Generated image: ${prompt}`,
        metadata: { type: 'image_generation', prompt }
      });

      toast({
        title: "🎨 Image Generated!",
        description: `Created image: ${prompt.substring(0, 50)}...`,
      });

    } catch (error: any) {
      handleError(error.message);
    }
  };

  // Video Generation
  const generateVideo = async () => {
    if (!prompt.trim()) return;

    try {
      const response = await callMultimodalAPI('generate_video', {
        prompt,
        duration: 5
      });

      addResult({
        type: 'video',
        content: response.videos[0].url,
        metadata: { prompt, duration: 5 },
        timestamp: new Date().toISOString()
      });

      // Store in memory
      await callMemoryAPI('store_memory', {
        content: `Generated video: ${prompt}`,
        metadata: { type: 'video_generation', prompt }
      });

      toast({
        title: "🎬 Video Generated!",
        description: `Created video: ${prompt.substring(0, 50)}...`,
      });

    } catch (error: any) {
      handleError(error.message);
    }
  };

  // Text to Speech
  const textToSpeech = async () => {
    if (!prompt.trim()) return;

    try {
      const response = await callMultimodalAPI('text_to_speech', {
        text: prompt,
        voice: 'alloy'
      });

      // Create audio element and play
      const audio = new Audio(`data:audio/mp3;base64,${response.audioContent}`);
      audio.play();

      addResult({
        type: 'audio',
        content: response.audioContent,
        metadata: { text: prompt, voice: 'alloy' },
        timestamp: new Date().toISOString()
      });

      toast({
        title: "🗣️ Speech Generated!",
        description: "Audio is now playing",
      });

    } catch (error: any) {
      handleError(error.message);
    }
  };

  // Voice Recording
  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            try {
              const response = await callMultimodalAPI('speech_to_text', {
                audioData: base64Audio
              });

              setPrompt(response.text);
              
              addResult({
                type: 'text',
                content: response.text,
                metadata: { type: 'speech_to_text' },
                timestamp: new Date().toISOString()
              });

              toast({
                title: "🎤 Speech Transcribed!",
                description: "Text has been added to the prompt field",
              });

            } catch (error: any) {
              handleError(error.message);
            }
          };
          
          reader.readAsDataURL(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        
        toast({
          title: "🎤 Recording Started",
          description: "Speak your prompt...",
        });

      } catch (error: any) {
        handleError("Microphone access denied");
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      
      toast({
        title: "🎤 Recording Stopped",
        description: "Processing speech...",
      });
    }
  };

  // File Upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64File = (reader.result as string).split(',')[1];
        
        try {
          // Upload file
          const uploadResponse = await callFileAPI('upload_file', {
            file: base64File,
            fileName: file.name,
            fileType: file.type
          });

          // Analyze file
          const analysisResponse = await callFileAPI('analyze_file', {
            file: base64File,
            fileName: file.name,
            fileType: file.type,
            analysisPrompt: prompt || 'Analyze this file in detail.'
          });

          addResult({
            type: 'analysis',
            content: analysisResponse.analysis,
            metadata: { 
              fileName: file.name, 
              fileType: file.type,
              fileUrl: uploadResponse.fileUrl
            },
            timestamp: new Date().toISOString()
          });

          // Store in memory
          await callMemoryAPI('store_memory', {
            content: `Analyzed file: ${file.name} - ${analysisResponse.analysis}`,
            metadata: { type: 'file_analysis', fileName: file.name }
          });

          toast({
            title: "📁 File Analyzed!",
            description: `Successfully analyzed ${file.name}`,
          });

        } catch (error: any) {
          handleError(error.message);
        }
      };
      
      reader.readAsDataURL(file);

    } catch (error: any) {
      handleError(error.message);
    }
  };

  // Memory Functions
  const searchMemory = async () => {
    if (!prompt.trim()) return;

    try {
      const response = await callMemoryAPI('search_memory', {
        query: prompt
      });

      setMemories(response.results || []);
      
      toast({
        title: "🧠 Memory Search Complete",
        description: `Found ${response.results?.length || 0} relevant memories`,
      });

    } catch (error: any) {
      handleError(error.message);
    }
  };

  const getContextualMemory = async () => {
    if (!prompt.trim()) return;

    try {
      const response = await callMemoryAPI('get_context', {
        query: prompt
      });

      addResult({
        type: 'text',
        content: response.context || 'No contextual memory found',
        metadata: { type: 'contextual_memory', summary: response.summary },
        timestamp: new Date().toISOString()
      });

      toast({
        title: "🧩 Contextual Memory Retrieved",
        description: "Memory context added to results",
      });

    } catch (error: any) {
      handleError(error.message);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
          🧊 Yeti Multimodal AI Studio
        </h1>
        <p className="text-muted-foreground">
          Generate images, videos, process files, and manage AI memory - all in one place
        </p>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Zap className="h-5 w-5 text-blue-500 animate-pulse" />
              <div className="flex-1">
                <Progress value={progress} className="w-full" />
              </div>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Control Panel
              </CardTitle>
              <CardDescription>Input your prompts and commands</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt / Query</label>
                <Textarea
                  placeholder="Enter your prompt, question, or description..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Voice Input */}
              <div className="flex gap-2">
                <Button
                  onClick={toggleRecording}
                  variant={isRecording ? "destructive" : "outline"}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                  {isRecording ? "Stop Recording" : "Voice Input"}
                </Button>
                <Button
                  onClick={textToSpeech}
                  variant="outline"
                  disabled={!prompt.trim() || isProcessing}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload File</label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx"
                  />
                </div>
                {selectedFile && (
                  <Badge variant="outline" className="text-xs">
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                  </Badge>
                )}
              </div>

              {/* Generation Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={generateImage}
                  variant="outline"
                  disabled={!prompt.trim() || isProcessing}
                  className="h-12"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Generate Image
                </Button>
                <Button
                  onClick={generateVideo}
                  variant="outline"
                  disabled={!prompt.trim() || isProcessing}
                  className="h-12"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Generate Video
                </Button>
              </div>

              {/* Memory Functions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={searchMemory}
                  variant="outline"
                  disabled={!prompt.trim() || isProcessing}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Search Memory
                </Button>
                <Button
                  onClick={getContextualMemory}
                  variant="outline"
                  disabled={!prompt.trim() || isProcessing}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Get Context
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Memory Results */}
          {memories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Memory Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {memories.map((memory, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-xs">
                      <p className="font-medium">{memory.content?.substring(0, 100)}...</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Score: {memory.relevanceScore?.toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Results
                <Badge variant="outline">{results.length}</Badge>
              </CardTitle>
              <CardDescription>Your generated content and analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[700px] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No results yet</p>
                    <p className="text-sm">Generate images, videos, or analyze files to see results here</p>
                  </div>
                ) : (
                  results.map((result, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {result.type === 'image' && <Image className="h-4 w-4" />}
                            {result.type === 'video' && <Video className="h-4 w-4" />}
                            {result.type === 'audio' && <Headphones className="h-4 w-4" />}
                            {result.type === 'text' && <FileText className="h-4 w-4" />}
                            {result.type === 'analysis' && <Eye className="h-4 w-4" />}
                            <Badge variant="outline" className="text-xs">
                              {result.type.toUpperCase()}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {result.type === 'image' && (
                          <div className="space-y-2">
                            <img 
                              src={result.content} 
                              alt="Generated" 
                              className="w-full max-w-md rounded-lg border"
                            />
                            {result.metadata?.prompt && (
                              <p className="text-sm text-muted-foreground">
                                Prompt: {result.metadata.prompt}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {result.type === 'video' && (
                          <div className="space-y-2">
                            <video 
                              src={result.content} 
                              controls 
                              className="w-full max-w-md rounded-lg border"
                            />
                            {result.metadata?.prompt && (
                              <p className="text-sm text-muted-foreground">
                                Prompt: {result.metadata.prompt}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {result.type === 'audio' && (
                          <div className="space-y-2">
                            <audio controls className="w-full">
                              <source src={`data:audio/mp3;base64,${result.content}`} type="audio/mp3" />
                            </audio>
                            {result.metadata?.text && (
                              <p className="text-sm text-muted-foreground">
                                Text: {result.metadata.text}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {(result.type === 'text' || result.type === 'analysis') && (
                          <div className="space-y-2">
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="text-sm whitespace-pre-wrap">{result.content}</p>
                            </div>
                            {result.metadata?.fileName && (
                              <p className="text-sm text-muted-foreground">
                                File: {result.metadata.fileName}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}