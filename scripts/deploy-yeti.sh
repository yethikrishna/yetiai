#!/bin/bash

# 🧊 Yeti AI Platform - Deployment Script
# This script helps automate the setup and deployment process

echo "🧊 Yeti AI Platform - Deployment Script"
echo "======================================="

# Check if required tools are installed
check_requirements() {
    echo "🔍 Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check npm or bun
    if ! command -v npm &> /dev/null && ! command -v bun &> /dev/null; then
        echo "❌ npm or bun is not installed. Please install one of them first."
        exit 1
    fi
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        echo "⚠️  .env.local not found. Please copy .env.example to .env.local and fill in your API keys."
        echo "   cp .env.example .env.local"
        exit 1
    fi
    
    echo "✅ All requirements satisfied!"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    if command -v bun &> /dev/null; then
        echo "Using bun..."
        bun install
    else
        echo "Using npm..."
        npm install
    fi
    
    echo "✅ Dependencies installed!"
}

# Check environment variables
check_env_vars() {
    echo "🔑 Checking environment variables..."
    
    # Check if required vars are set
    if [ -z "$VITE_CLERK_PUBLISHABLE_KEY" ]; then
        echo "⚠️  VITE_CLERK_PUBLISHABLE_KEY not set in .env.local"
    fi
    
    if [ -z "$VITE_SUPABASE_URL" ]; then
        echo "⚠️  VITE_SUPABASE_URL not set in .env.local"
    fi
    
    if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
        echo "⚠️  VITE_SUPABASE_ANON_KEY not set in .env.local"
    fi
    
    echo "✅ Environment variables checked!"
}

# Deploy Supabase functions
deploy_functions() {
    echo "🚀 Deploying Supabase functions..."
    
    # Check if supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        echo "📦 Installing Supabase CLI..."
        npm install -g supabase
    fi
    
    # Deploy functions
    echo "Deploying edge functions..."
    supabase functions deploy
    
    echo "✅ Functions deployed!"
}

# Build the project
build_project() {
    echo "🏗️  Building project..."
    
    if command -v bun &> /dev/null; then
        bun run build
    else
        npm run build
    fi
    
    echo "✅ Project built successfully!"
}

# Start development server
start_dev() {
    echo "🚀 Starting development server..."
    
    if command -v bun &> /dev/null; then
        bun run dev
    else
        npm run dev
    fi
}

# Main deployment function
main() {
    echo "🧊 Starting Yeti AI Platform deployment..."
    
    # Parse command line arguments
    case "${1:-setup}" in
        "setup")
            check_requirements
            install_dependencies
            check_env_vars
            echo ""
            echo "🎉 Setup complete! Next steps:"
            echo "1. Configure your API keys in .env.local"
            echo "2. Run: ./scripts/deploy-yeti.sh functions"
            echo "3. Run: ./scripts/deploy-yeti.sh dev"
            ;;
        "functions")
            deploy_functions
            ;;
        "build")
            build_project
            ;;
        "dev")
            start_dev
            ;;
        "full")
            check_requirements
            install_dependencies
            check_env_vars
            deploy_functions
            build_project
            echo ""
            echo "🎉 Full deployment complete!"
            echo "Your Yeti AI platform is ready to use!"
            ;;
        *)
            echo "Usage: $0 [setup|functions|build|dev|full]"
            echo ""
            echo "Commands:"
            echo "  setup     - Install dependencies and check environment"
            echo "  functions - Deploy Supabase edge functions"
            echo "  build     - Build the project for production"
            echo "  dev       - Start development server"
            echo "  full      - Complete deployment (setup + functions + build)"
            ;;
    esac
}

# Run the main function
main "$@"