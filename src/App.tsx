
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from '@clerk/clerk-react';
import Index from "./pages/Index";
import McpTest from "./pages/McpTest";
import PlatformsConnect from "./pages/PlatformsConnect";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// The early throw new Error for missing PUBLISHABLE_KEY has been removed from here.

function App() {
  if (!PUBLISHABLE_KEY) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', color: 'red' }}>
        <h1>Configuration Error</h1>
        <p>The application is missing a required configuration (VITE_CLERK_PUBLISHABLE_KEY).</p>
        <p>Please ensure this environment variable is set.</p>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/mcp-test" element={<McpTest />} />
              <Route path="/platforms" element={<PlatformsConnect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
