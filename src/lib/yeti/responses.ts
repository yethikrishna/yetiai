
import { Platform } from '@/types/platform';

export const getNow = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const generateResponse = (userMessage: string, connectedPlatforms: Platform[]): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Platform-specific responses
  if (lowerMessage.includes('github') && connectedPlatforms.some(p => p.id === 'github')) {
    return "🧊 I can help you with GitHub! I can create repositories, manage issues, review pull requests, and more. What would you like me to do?";
  }
  
  if (lowerMessage.includes('email') || lowerMessage.includes('gmail')) {
    const hasEmail = connectedPlatforms.some(p => p.id === 'gmail' || p.id === 'outlook');
    if (hasEmail) {
      return "📧 I can help you manage your emails! I can read, send, organize, and even draft responses. What email task can I assist with?";
    } else {
      return "📧 I'd love to help with emails! Please connect Gmail or Outlook first from the connections page.";
    }
  }

  if (lowerMessage.includes('social') || lowerMessage.includes('twitter') || lowerMessage.includes('post')) {
    const socialPlatforms = connectedPlatforms.filter(p => p.category === 'social-media');
    if (socialPlatforms.length > 0) {
      return `📱 I can help with your social media! You have ${socialPlatforms.map(p => p.name).join(', ')} connected. I can post updates, schedule content, analyze engagement, and more!`;
    } else {
      return "📱 I can help with social media management! Connect platforms like Twitter, LinkedIn, or Instagram to get started.";
    }
  }

  if (lowerMessage.includes('ai') || lowerMessage.includes('gpt') || lowerMessage.includes('openai')) {
    const hasAI = connectedPlatforms.some(p => p.category === 'ai-tools');
    if (hasAI) {
      return "🤖 Perfect! I can leverage your connected AI tools to help with content generation, analysis, coding assistance, and more complex tasks!";
    } else {
      return "🤖 I can help you connect to AI platforms like OpenAI, Claude, or Hugging Face to supercharge my capabilities!";
    }
  }

  if (lowerMessage.includes('automate') || lowerMessage.includes('workflow')) {
    return `⚡ I love automation! With your ${connectedPlatforms.length} connected platforms, we can create powerful workflows. I can help you set up cross-platform automations, scheduled tasks, and smart triggers.`;
  }

  // General responses based on connected platforms
  if (connectedPlatforms.length > 0) {
    const capabilities = [
      "cross-platform data sync",
      "automated workflows",
      "content management",
      "data analysis",
      "smart notifications"
    ];
    return `🧊 With your connected platforms (${connectedPlatforms.map(p => p.name).join(', ')}), I can help with ${capabilities.slice(0, 3).join(', ')}, and much more! What specific task would you like assistance with?`;
  }

  // Default responses for unconnected state
  const responses = [
    "🧊 I'm still growing my capabilities! Right now I'm in demo mode, but soon I'll be able to perform real actions across all your connected platforms.",
    "❄️ That's an interesting request! Once you connect some platforms, I'll be able to help you with actual tasks and automations.",
    "🧊 I'm excited to help! Connect some platforms from the sidebar and I'll show you what I can really do.",
    "❄️ Great question! I'm designed to work across multiple platforms. Connect a few and let's see what we can accomplish together!"
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};
