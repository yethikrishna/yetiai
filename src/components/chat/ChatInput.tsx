import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Image, Video, FileText, X } from "lucide-react";
import { Platform } from "@/types/platform";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSend: () => void;
  isBotThinking: boolean;
  connectedPlatforms: Platform[];
}

interface AttachedFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'document';
  preview?: string;
}

export function ChatInput({ input, setInput, handleSend, isBotThinking, connectedPlatforms }: ChatInputProps) {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileAttach = (type: 'image' | 'video' | 'document') => {
    const inputRef = type === 'image' ? imageInputRef : type === 'video' ? videoInputRef : fileInputRef;
    inputRef.current?.click();
  };

  const processFile = (file: File, type: 'image' | 'video' | 'document') => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    const id = Date.now().toString();
    const attachedFile: AttachedFile = { id, file, type };

    // Create preview for images
    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        attachedFile.preview = e.target?.result as string;
        setAttachedFiles(prev => [...prev, attachedFile]);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachedFiles(prev => [...prev, attachedFile]);
    }

    toast({
      title: "File attached",
      description: `${file.name} has been attached to your message`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, type);
    }
    e.target.value = ''; // Reset input
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSendWithFiles = () => {
    // In a real implementation, you would upload files and include their URLs/data in the message
    if (attachedFiles.length > 0) {
      console.log('Sending message with files:', attachedFiles);
      // For now, we'll just mention the files in the input
      const fileDescriptions = attachedFiles.map(f => `[${f.type}: ${f.file.name}]`).join(' ');
      const newInput = `${input} ${fileDescriptions}`.trim();
      setInput(newInput);
      setAttachedFiles([]);
    }
    handleSend();
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      {/* File Attachments Preview */}
      {attachedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachedFiles.map((file) => (
            <div key={file.id} className="relative bg-slate-100 rounded-lg p-2 flex items-center gap-2 max-w-xs">
              {file.type === 'image' && file.preview && (
                <img src={file.preview} alt={file.file.name} className="w-8 h-8 object-cover rounded" />
              )}
              {file.type === 'video' && <Video className="w-4 h-4 text-blue-600" />}
              {file.type === 'document' && <FileText className="w-4 h-4 text-green-600" />}
              <span className="text-sm truncate">{file.file.name}</span>
              <Button
                size="sm"
                variant="ghost"
                className="w-4 h-4 p-0 hover:bg-red-100"
                onClick={() => removeFile(file.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Connected Platforms Indicator */}
      {connectedPlatforms.length > 0 && (
        <div className="mb-3 text-xs text-slate-600 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Connected to {connectedPlatforms.length} platform{connectedPlatforms.length === 1 ? '' : 's'}</span>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment Buttons */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-10 w-10 p-0"
            onClick={() => handleFileAttach('image')}
            title="Attach Image"
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-10 w-10 p-0"
            onClick={() => handleFileAttach('video')}
            title="Attach Video"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-10 w-10 p-0"
            onClick={() => handleFileAttach('document')}
            title="Attach Document"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message Yeti${connectedPlatforms.length > 0 ? ' (AI has access to your connected platforms)' : ''}...`}
            disabled={isBotThinking}
            className="pr-12"
          />
        </div>

        {/* Send Button */}
        <Button 
          onClick={handleSendWithFiles} 
          disabled={(!input.trim() && attachedFiles.length === 0) || isBotThinking}
          size="sm"
          className="h-10 px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'image')}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => handleFileChange(e, 'video')}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx"
        onChange={(e) => handleFileChange(e, 'document')}
        className="hidden"
      />
    </div>
  );
}
