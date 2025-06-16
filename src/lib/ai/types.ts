
export interface AIProvider {
  name: string;
  generateResponse(userMessage: string, connectedPlatforms: any[]): Promise<string>;
  isAvailable(): boolean;
}

export interface AIServiceConfig {
  providers: AIProvider[];
  fallbackEnabled: boolean;
}
