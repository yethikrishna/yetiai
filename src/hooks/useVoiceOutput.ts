import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VoiceSettings {
  voiceId: string;
  stability: number;
  similarityBoost: number;
  speed: number;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceId: '9BWtsMINqrJLrRacOk9x', // Aria voice
  stability: 0.5,
  similarityBoost: 0.75,
  speed: 1.0
};

export function useVoiceOutput() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const { toast } = useToast();

  const generateSpeech = useCallback(async (
    text: string, 
    settings: Partial<VoiceSettings> = {}
  ): Promise<void> => {
    if (!text.trim()) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('yeti-text-to-speech', {
        body: {
          text: text.trim(),
          voice_id: settings.voiceId || voiceSettings.voiceId,
          stability: settings.stability || voiceSettings.stability,
          similarity_boost: settings.similarityBoost || voiceSettings.similarityBoost,
          speed: settings.speed || voiceSettings.speed
        }
      });

      if (error) throw error;

      if (data.audioContent) {
        await playAudio(data.audioContent);
      }

    } catch (error) {
      console.error('Error generating speech:', error);
      toast({
        title: "🔊 Voice Error",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [voiceSettings, toast]);

  const playAudio = useCallback(async (base64Audio: string): Promise<void> => {
    try {
      setIsPlaying(true);
      
      // Convert base64 to blob
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: "🔊 Playback Error",
          description: "Failed to play generated speech",
          variant: "destructive",
        });
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      toast({
        title: "🔊 Playback Error",
        description: "Failed to play generated speech",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopAudio = useCallback(() => {
    // Stop any currently playing audio
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setIsPlaying(false);
  }, []);

  const updateVoiceSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    generateSpeech,
    isGenerating,
    isPlaying,
    stopAudio,
    voiceSettings,
    updateVoiceSettings
  };
}