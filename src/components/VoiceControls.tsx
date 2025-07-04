import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VoiceSettings } from '@/hooks/useVoiceOutput';
import { Volume2, VolumeX, Settings, Mic, MicOff } from 'lucide-react';

interface VoiceControlsProps {
  voiceSettings: VoiceSettings;
  onVoiceSettingsChange: (settings: Partial<VoiceSettings>) => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  isListening: boolean;
  isGenerating: boolean;
  isPlaying: boolean;
  onStopAudio: () => void;
}

const VOICE_OPTIONS = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', description: 'Friendly and clear' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Professional and warm' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Deep and authoritative' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', description: 'Elegant and sophisticated' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Youthful and energetic' }
];

export function VoiceControls({
  voiceSettings,
  onVoiceSettingsChange,
  isVoiceEnabled,
  onToggleVoice,
  isListening,
  isGenerating,
  isPlaying,
  onStopAudio
}: VoiceControlsProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="space-y-4">
      {/* Main Voice Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={isVoiceEnabled ? "default" : "outline"}
          size="sm"
          onClick={onToggleVoice}
          className="flex items-center gap-2"
        >
          {isVoiceEnabled ? (
            <>
              <Volume2 className="w-4 h-4" />
              Voice On
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4" />
              Voice Off
            </>
          )}
        </Button>

        {isPlaying && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onStopAudio}
            className="flex items-center gap-2"
          >
            <VolumeX className="w-4 h-4" />
            Stop
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isListening && (
            <span className="flex items-center gap-1 text-blue-600">
              <Mic className="w-3 h-3 animate-pulse" />
              Listening
            </span>
          )}
          {isGenerating && (
            <span className="flex items-center gap-1 text-orange-600">
              <Volume2 className="w-3 h-3 animate-pulse" />
              Generating
            </span>
          )}
          {isPlaying && (
            <span className="flex items-center gap-1 text-green-600">
              <Volume2 className="w-3 h-3 animate-pulse" />
              Playing
            </span>
          )}
        </div>
      </div>

      {/* Voice Settings Panel */}
      {showSettings && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-sm">Voice Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Voice Selection */}
            <div className="space-y-2">
              <Label>Voice</Label>
              <Select
                value={voiceSettings.voiceId}
                onValueChange={(value) => onVoiceSettingsChange({ voiceId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div>
                        <div className="font-medium">{voice.name}</div>
                        <div className="text-xs text-muted-foreground">{voice.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stability */}
            <div className="space-y-2">
              <Label>Stability: {voiceSettings.stability}</Label>
              <Slider
                value={[voiceSettings.stability]}
                onValueChange={(value) => onVoiceSettingsChange({ stability: value[0] })}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher values make the voice more stable but less expressive
              </p>
            </div>

            {/* Similarity Boost */}
            <div className="space-y-2">
              <Label>Clarity: {voiceSettings.similarityBoost}</Label>
              <Slider
                value={[voiceSettings.similarityBoost]}
                onValueChange={(value) => onVoiceSettingsChange({ similarityBoost: value[0] })}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher values improve voice clarity and similarity
              </p>
            </div>

            {/* Speed */}
            <div className="space-y-2">
              <Label>Speed: {voiceSettings.speed}x</Label>
              <Slider
                value={[voiceSettings.speed]}
                onValueChange={(value) => onVoiceSettingsChange({ speed: value[0] })}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Adjust speech speed from 0.5x to 2x
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}