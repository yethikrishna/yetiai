import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Search, FileText, Download, Zap, Clock } from "lucide-react";
import { useYetiAI } from "@/hooks/useYetiAI";
import { useToast } from "@/hooks/use-toast";

interface ScrapingResult {
  url: string;
  content: string;
  action: string;
  timestamp: Date;
}

export function YetiWebScraper() {
  const [url, setUrl] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [scrapingResults, setScrapingResults] = useState<ScrapingResult[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  
  const { scrapeWebsite } = useYetiAI();
  const { toast } = useToast();

  const handleScrapeWebsite = async (action: 'scrape' | 'interact' | 'extract' = 'scrape') => {
    if (!url.trim()) {
      toast({
        title: "❄️ URL Required",
        description: "Please enter a valid URL to scrape.",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    try {
      const prompt = customPrompt.trim() || getDefaultPrompt(action);
      const response = await scrapeWebsite(url, prompt, action);

      const newResult: ScrapingResult = {
        url: response.url,
        content: response.content,
        action: response.action,
        timestamp: new Date(),
      };

      setScrapingResults(prev => [newResult, ...prev]);
      
      // Store in memory for future reference
      // await storeMemory(response.content, `Web content from ${url}`, 'web_page');
    } catch (error) {
      console.error('Web scraping error:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const getDefaultPrompt = (action: string) => {
    switch (action) {
      case 'extract':
        return "Extract the main content, key information, and important data from this webpage. Focus on text content, headings, and structured data.";
      case 'interact':
        return "Analyze the interactive elements, forms, buttons, and navigation structure of this webpage.";
      case 'scrape':
      default:
        return "Scrape and summarize the main content of this webpage, including headlines, key points, and important information.";
    }
  };

  const handleDownloadContent = (result: ScrapingResult) => {
    const blob = new Blob([result.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yeti-scraper-${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const presetUrls = [
    "https://news.ycombinator.com",
    "https://techcrunch.com",
    "https://github.com/trending",
    "https://reddit.com/r/technology",
    "https://stackoverflow.com/questions",
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🔍 Yeti Web Scraper</h1>
        <p className="text-gray-600">Extract and analyze web content with AI intelligence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Scraping Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* URL Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Website URL</label>
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              {/* Preset URLs */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quick Access</label>
                <div className="space-y-1">
                  {presetUrls.map((presetUrl, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left text-xs justify-start"
                      onClick={() => setUrl(presetUrl)}
                    >
                      {presetUrl.replace('https://', '')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Instructions (Optional)</label>
                <Textarea
                  placeholder="What specific information do you want to extract?"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => handleScrapeWebsite('scrape')}
                  disabled={!url.trim() || isExtracting}
                  className="w-full"
                  size="lg"
                >
                  {isExtracting ? (
                    <>
                      <Search className="h-4 w-4 mr-2 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Scrape Content
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleScrapeWebsite('extract')}
                    disabled={!url.trim() || isExtracting}
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Extract
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleScrapeWebsite('interact')}
                    disabled={!url.trim() || isExtracting}
                    size="sm"
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Analyze
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Extracted Content
              </CardTitle>
              <CardDescription>
                AI-processed web content and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scrapingResults.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Scrape! 🔍</h3>
                  <p className="text-gray-600 mb-4">
                    Enter a URL and let Yeti AI extract and analyze the content.
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-green-600">
                      <Globe className="h-3 w-3 mr-1" />
                      Smart Extraction
                    </Badge>
                    <Badge variant="outline" className="text-blue-600">
                      <FileText className="h-3 w-3 mr-1" />
                      AI Analysis
                    </Badge>
                    <Badge variant="outline" className="text-purple-600">
                      <Zap className="h-3 w-3 mr-1" />
                      Fast Processing
                    </Badge>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="latest" className="h-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="latest">Latest Result</TabsTrigger>
                    <TabsTrigger value="history">History ({scrapingResults.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="latest" className="h-full">
                    {scrapingResults[0] && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{scrapingResults[0].action}</Badge>
                            <span className="text-sm text-gray-600">
                              {scrapingResults[0].url}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">
                              {scrapingResults[0].timestamp.toLocaleTimeString()}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadContent(scrapingResults[0])}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <ScrollArea className="h-96 p-4 border rounded-lg bg-gray-50">
                          <pre className="whitespace-pre-wrap text-sm">
                            {scrapingResults[0].content}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {scrapingResults.map((result, index) => (
                          <Card key={index}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{result.action}</Badge>
                                  <span className="text-sm font-medium truncate">
                                    {result.url}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {result.timestamp.toLocaleString()}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadContent(result)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {result.content.substring(0, 200)}...
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}