import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Image, Download, Sparkles, Palette, Wand2 } from "lucide-react";
import { useYetiAI } from "@/hooks/useYetiAI";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export function YetiImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [width, setWidth] = useState([1024]);
  const [height, setHeight] = useState([1024]);
  const [steps, setSteps] = useState([20]);
  const [guidanceScale, setGuidanceScale] = useState([7.5]);
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; prompt: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { models, loadModels, generateImage, getModelsByType } = useYetiAI();
  const { toast } = useToast();

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    const imageModels = getModelsByType('image');
    if (imageModels.length > 0 && !selectedModel) {
      setSelectedModel(imageModels[0].model_name);
    }
  }, [models, selectedModel, getModelsByType]);

  const handleGenerateImage = async () => {
    if (!prompt.trim() || !selectedModel) return;

    setIsGenerating(true);
    try {
      const response = await generateImage(selectedModel, prompt, {
        width: width[0],
        height: height[0],
        steps: steps[0],
        guidance_scale: guidanceScale[0],
      });

      if (response.images && response.images.length > 0) {
        setGeneratedImages(prev => [
          { url: response.images[0].url, prompt: response.prompt },
          ...prev
        ]);
      }
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = (imageUrl: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `yeti-art-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const imageModels = getModelsByType('image');

  const presetPrompts = [
    "A majestic yeti standing on a snowy mountain peak at sunset, digital art, cinematic lighting",
    "Futuristic AI laboratory with glowing blue screens and advanced technology, cyberpunk style",
    "Abstract crystalline structures floating in space with aurora-like colors, ultra detailed",
    "A wise yeti sage meditating in an ice cave filled with glowing crystals, fantasy art",
    "Minimalist logo design for a tech company, clean lines, modern, professional",
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🎨 Yeti Art Studio</h1>
        <p className="text-gray-600">Create stunning images with advanced AI models</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label>Yeti Art Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Art Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageModels.map((model) => (
                      <SelectItem key={model.id} value={model.model_name}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-purple-600">Art</Badge>
                          <span>{model.yeti_display_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <Label>Image Description</Label>
                <Textarea
                  placeholder="Describe the image you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Preset Prompts */}
              <div className="space-y-2">
                <Label>Preset Ideas</Label>
                <div className="space-y-2">
                  {presetPrompts.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left text-xs h-auto p-2"
                      onClick={() => setPrompt(preset)}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Width: {width[0]}px</Label>
                  <Slider
                    value={width}
                    onValueChange={setWidth}
                    max={1920}
                    min={512}
                    step={64}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height: {height[0]}px</Label>
                  <Slider
                    value={height}
                    onValueChange={setHeight}
                    max={1920}
                    min={512}
                    step={64}
                  />
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Steps: {steps[0]}</Label>
                  <Slider
                    value={steps}
                    onValueChange={setSteps}
                    max={50}
                    min={10}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Guidance Scale: {guidanceScale[0]}</Label>
                  <Slider
                    value={guidanceScale}
                    onValueChange={setGuidanceScale}
                    max={20}
                    min={1}
                    step={0.5}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateImage}
                disabled={!prompt.trim() || !selectedModel || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Art...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={66} className="w-full" />
                  <p className="text-sm text-center text-gray-600">
                    Yeti AI is painting your masterpiece...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generated Images */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Generated Artwork
              </CardTitle>
              <CardDescription>
                Your AI-generated images will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedImages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Image className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Create! 🎨</h3>
                  <p className="text-gray-600 mb-4">
                    Enter a description and let Yeti AI bring your imagination to life.
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-purple-600">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI-Powered
                    </Badge>
                    <Badge variant="outline" className="text-pink-600">
                      <Palette className="h-3 w-3 mr-1" />
                      High Quality
                    </Badge>
                    <Badge variant="outline" className="text-blue-600">
                      <Wand2 className="h-3 w-3 mr-1" />
                      Multiple Models
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedImages.map((image, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="p-3">
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {image.prompt}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleDownloadImage(image.url, image.prompt)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}