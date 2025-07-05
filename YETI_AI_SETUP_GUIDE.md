# 🧊 Yeti AI Platform - Complete Setup Guide

## Overview
Transform your Yeti AI platform from a frontend-only demo into a fully functional AI-powered application with chat, image generation, video creation, and advanced AI tools.

## 🔧 Prerequisites

- Node.js 18+ or Bun
- Supabase account and project
- API keys for AI services
- Basic understanding of React/TypeScript

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone and install dependencies
git clone <your-repo>
cd yeti-ai
npm install  # or bun install

# Copy environment template
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your actual API keys:

```env
# Frontend Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API Keys (Set these in Supabase Dashboard)
OPENAI_API_KEY=sk-your_openai_key_here
OPENROUTER_API_KEY=sk-or-your_openrouter_key_here
GEMINI_API_KEY=your_gemini_key_here
NOVITA_API_KEY=your_novita_key_here
A4F_API_KEY=your_a4f_key_here
```

### 3. Supabase Configuration

#### Deploy Edge Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy all functions
supabase functions deploy
```

#### Set Environment Variables in Supabase
Go to your Supabase dashboard → Settings → Edge Functions → Environment Variables and add:

- `OPENAI_API_KEY`
- `OPENROUTER_API_KEY`
- `GEMINI_API_KEY`
- `NOVITA_API_KEY`
- `A4F_API_KEY`

### 4. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
```

## 🔑 API Keys Setup Guide

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Add to your environment as `OPENAI_API_KEY`

### OpenRouter API Key
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up and verify your account
3. Add credits to your account
4. Generate an API key
5. Add to your environment as `OPENROUTER_API_KEY`

### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new project or select existing
3. Enable the Gemini API
4. Create API credentials
5. Add to your environment as `GEMINI_API_KEY`

### Novita API Key
1. Visit [Novita AI](https://novita.ai/)
2. Sign up and verify account
3. Navigate to API section
4. Generate API key
5. Add to your environment as `NOVITA_API_KEY`

### A4F API Key (Image/Video Generation)
1. Go to [A4F.co](https://a4f.co/)
2. Create account and verify
3. Subscribe to image/video generation plan
4. Get API key from dashboard
5. Add to your environment as `A4F_API_KEY`

## 🏗️ Architecture Overview

### Frontend (React + TypeScript)
- **UI Framework**: React with Tailwind CSS
- **Components**: Radix UI components
- **State Management**: React hooks and context
- **Authentication**: Clerk
- **Database**: Supabase client
- **Build Tool**: Vite

### Backend (Supabase Edge Functions)
- **Runtime**: Deno
- **Functions**:
  - `yeti-ai-chat`: Multi-provider AI chat with fallbacks
  - `yeti-image-generation`: AI image generation
  - `yeti-video-generation`: AI video creation
  - `yeti-text-to-speech`: Text-to-speech conversion
  - `yeti-memory-service`: Chat memory and sessions
  - `yeti-browser-agent`: Web scraping and automation
  - `yeti-plugin-executor`: Dynamic tool execution

### AI Providers Integration
- **Primary**: OpenAI (GPT-4, GPT-4 Turbo, TTS)
- **Secondary**: OpenRouter (Claude, Llama, Mixtral)
- **Image/Video**: A4F (Flux, Minimax Video)
- **Backup**: Gemini, Novita

## 🧪 Testing the Setup

### 1. Test Chat Functionality
1. Start the application
2. Navigate to the main chat interface
3. Send a message
4. Verify AI response is generated
5. Check that conversation is saved to memory

### 2. Test Image Generation
1. Go to Tools page
2. Click on AI Image Generator
3. Enter a prompt
4. Verify image is generated and displayed
5. Check download functionality

### 3. Test Video Generation
1. Use the video generation tool
2. Enter a video prompt
3. Verify video is created (may take several minutes)
4. Check video playback and download

### 4. Test Text-to-Speech
1. Go to the TTS tool
2. Enter text to convert
3. Verify audio file is generated
4. Check audio playback and download

## 🔧 Troubleshooting

### Common Issues

#### 1. "API key not configured" Error
- **Solution**: Ensure API keys are set in Supabase dashboard
- **Check**: Edge Functions → Environment Variables

#### 2. CORS Errors
- **Solution**: Verify Supabase URL and anon key in frontend env
- **Check**: Network tab for exact error details

#### 3. Function Not Found
- **Solution**: Deploy edge functions using Supabase CLI
- **Command**: `supabase functions deploy`

#### 4. Image Generation Fails
- **Solution**: Check A4F API key and account credits
- **Alternative**: Switch to different provider in code

#### 5. Chat Not Responding
- **Solution**: Check OpenAI API key and account balance
- **Fallback**: System will try OpenRouter, then Gemini

### Debug Mode

Enable debug logging by adding to your environment:
```env
NODE_ENV=development
VITE_DEBUG=true
```

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Netlify Deployment
```bash
# Build the project
npm run build

# Deploy to Netlify
# Upload the `dist` folder to Netlify dashboard
```

### Environment Variables for Production
Make sure to set all environment variables in your deployment platform:
- Vercel: Dashboard → Project → Settings → Environment Variables
- Netlify: Dashboard → Site → Settings → Environment Variables

## 📋 Feature Checklist

### Core Features
- [x] Multi-provider AI chat with fallbacks
- [x] Persistent chat memory and sessions
- [x] Image generation with Flux models
- [x] Video generation with Minimax
- [x] Text-to-speech with OpenAI TTS
- [x] Voice input and output
- [x] Tool launcher system
- [x] Authentication and user management
- [x] Responsive mobile-friendly UI

### Advanced Features
- [ ] Advanced RAG (Retrieval Augmented Generation)
- [ ] Custom AI model fine-tuning
- [ ] Web scraping and automation
- [ ] Plugin system for custom tools
- [ ] Analytics and usage tracking
- [ ] Team collaboration features
- [ ] API documentation and external access

## 🎯 Next Steps

1. **Configure API Keys** - Set up all required API keys
2. **Deploy Functions** - Deploy Supabase edge functions
3. **Test Core Features** - Verify chat, image, video generation
4. **Customize UI** - Modify branding and styling
5. **Add Custom Tools** - Extend with domain-specific functionality
6. **Monitor Usage** - Set up analytics and monitoring
7. **Scale Infrastructure** - Optimize for production load

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase function logs
3. Check browser console for frontend errors
4. Verify API key configurations
5. Test with minimal examples first

## 🔄 Updates

To update the platform:
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install

# Redeploy functions
supabase functions deploy

# Rebuild and deploy frontend
npm run build
```

---

**🧊 Yeti AI Platform** - Built with React, Supabase, and multiple AI providers for maximum reliability and functionality.