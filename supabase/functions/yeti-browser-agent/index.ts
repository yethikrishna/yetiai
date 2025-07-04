import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrowserAgentRequest {
  action: 'navigate' | 'click' | 'type' | 'screenshot' | 'extract' | 'form_fill' | 'scroll' | 'wait' | 'multi_tab';
  url?: string;
  selector?: string;
  text?: string;
  formData?: Record<string, string>;
  extractOptions?: {
    text?: boolean;
    links?: boolean;
    images?: boolean;
    forms?: boolean;
    metadata?: boolean;
  };
  waitCondition?: {
    type: 'element' | 'timeout' | 'load';
    value: string | number;
  };
  tabs?: Array<{
    url: string;
    actions: any[];
  }>;
  viewport?: {
    width: number;
    height: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const body: BrowserAgentRequest = await req.json();
    console.log('🌐 Yeti Browser Agent: Processing request:', body.action);

    let result: any = {};

    switch (body.action) {
      case 'navigate':
        result = await navigateToPage(body.url!);
        break;
      
      case 'screenshot':
        result = await takeScreenshot(body.url!);
        break;
      
      case 'extract':
        result = await extractPageData(body.url!, body.extractOptions);
        break;
      
      case 'form_fill':
        result = await fillForm(body.url!, body.formData!, body.selector);
        break;
      
      case 'click':
        result = await clickElement(body.url!, body.selector!);
        break;
      
      case 'type':
        result = await typeText(body.url!, body.selector!, body.text!);
        break;
      
      case 'scroll':
        result = await scrollPage(body.url!, body.selector);
        break;
      
      case 'wait':
        result = await waitForCondition(body.url!, body.waitCondition!);
        break;
      
      case 'multi_tab':
        result = await handleMultipleTabs(body.tabs!);
        break;
      
      default:
        throw new Error(`Unknown action: ${body.action}`);
    }

    // Log the browser action for audit trail
    if (supabaseClient) {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          await supabaseClient.from('browser_actions').insert({
            user_id: user.id,
            action: body.action,
            url: body.url,
            parameters: body,
            result: result,
            timestamp: new Date().toISOString()
          });
        }
      } catch (logError) {
        console.warn('Failed to log browser action:', logError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      action: body.action,
      result 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Browser agent error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function navigateToPage(url: string) {
  console.log('🔗 Navigating to:', url);
  
  // Simulate navigation - in a real implementation, this would use Playwright/Puppeteer
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; YetiAI-BrowserAgent/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to navigate: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    return {
      status: 'success',
      url: url,
      title: extractTitle(html),
      statusCode: response.status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Navigation failed: ${error.message}`);
  }
}

async function takeScreenshot(url: string) {
  console.log('📸 Taking screenshot of:', url);
  
  // Simulate screenshot - would integrate with browser automation service
  return {
    status: 'simulated',
    url: url,
    screenshotUrl: 'https://via.placeholder.com/1200x800/2563eb/ffffff?text=Yeti+Browser+Screenshot',
    timestamp: new Date().toISOString(),
    viewport: { width: 1200, height: 800 }
  };
}

async function extractPageData(url: string, options: any = {}) {
  console.log('🔍 Extracting data from:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; YetiAI-BrowserAgent/1.0)'
      }
    });
    
    const html = await response.text();
    const extracted: any = {};
    
    if (options.text !== false) {
      extracted.text = extractTextContent(html);
    }
    
    if (options.links) {
      extracted.links = extractLinks(html);
    }
    
    if (options.images) {
      extracted.images = extractImages(html);
    }
    
    if (options.forms) {
      extracted.forms = extractForms(html);
    }
    
    if (options.metadata !== false) {
      extracted.metadata = extractMetadata(html);
    }
    
    return {
      status: 'success',
      url: url,
      extracted,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Data extraction failed: ${error.message}`);
  }
}

async function fillForm(url: string, formData: Record<string, string>, selector?: string) {
  console.log('📝 Filling form on:', url);
  
  // Simulate form filling - would use browser automation
  return {
    status: 'simulated',
    url: url,
    formData: formData,
    selector: selector,
    fieldsCompleted: Object.keys(formData).length,
    timestamp: new Date().toISOString()
  };
}

async function clickElement(url: string, selector: string) {
  console.log('👆 Clicking element:', selector, 'on', url);
  
  return {
    status: 'simulated',
    url: url,
    selector: selector,
    action: 'click',
    timestamp: new Date().toISOString()
  };
}

async function typeText(url: string, selector: string, text: string) {
  console.log('⌨️ Typing text:', text, 'into', selector, 'on', url);
  
  return {
    status: 'simulated',
    url: url,
    selector: selector,
    text: text,
    action: 'type',
    timestamp: new Date().toISOString()
  };
}

async function scrollPage(url: string, selector?: string) {
  console.log('📜 Scrolling page:', url);
  
  return {
    status: 'simulated',
    url: url,
    selector: selector,
    action: 'scroll',
    timestamp: new Date().toISOString()
  };
}

async function waitForCondition(url: string, condition: any) {
  console.log('⏳ Waiting for condition:', condition, 'on', url);
  
  return {
    status: 'simulated',
    url: url,
    condition: condition,
    action: 'wait',
    timestamp: new Date().toISOString()
  };
}

async function handleMultipleTabs(tabs: Array<{ url: string; actions: any[] }>) {
  console.log('📑 Handling multiple tabs:', tabs.length, 'tabs');
  
  const results = [];
  
  for (const tab of tabs) {
    const tabResult = {
      url: tab.url,
      actions: [],
      timestamp: new Date().toISOString()
    };
    
    for (const action of tab.actions) {
      // Simulate action execution
      tabResult.actions.push({
        ...action,
        status: 'simulated',
        timestamp: new Date().toISOString()
      });
    }
    
    results.push(tabResult);
  }
  
  return {
    status: 'simulated',
    tabs: results,
    totalTabs: tabs.length,
    timestamp: new Date().toISOString()
  };
}

// Utility functions for HTML parsing
function extractTitle(html: string): string {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : 'Untitled';
}

function extractTextContent(html: string): string {
  // Simple text extraction - remove HTML tags
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 5000); // Limit to first 5000 characters
}

function extractLinks(html: string): string[] {
  const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>/gi;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    links.push(match[1]);
  }
  
  return links.slice(0, 50); // Limit to first 50 links
}

function extractImages(html: string): string[] {
  const imgRegex = /<img[^>]*src=["']([^"']*)["'][^>]*>/gi;
  const images = [];
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    images.push(match[1]);
  }
  
  return images.slice(0, 20); // Limit to first 20 images
}

function extractForms(html: string): any[] {
  const formRegex = /<form[^>]*>(.*?)<\/form>/gis;
  const forms = [];
  let match;
  
  while ((match = formRegex.exec(html)) !== null) {
    const formHtml = match[1];
    const inputRegex = /<input[^>]*name=["']([^"']*)["'][^>]*>/gi;
    const inputs = [];
    let inputMatch;
    
    while ((inputMatch = inputRegex.exec(formHtml)) !== null) {
      inputs.push(inputMatch[1]);
    }
    
    forms.push({
      inputs: inputs,
      html: formHtml.substring(0, 500) // Limit form HTML
    });
  }
  
  return forms.slice(0, 10); // Limit to first 10 forms
}

function extractMetadata(html: string): any {
  const metadata: any = {};
  
  // Extract meta tags
  const metaRegex = /<meta[^>]*name=["']([^"']*)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
  let match;
  
  while ((match = metaRegex.exec(html)) !== null) {
    metadata[match[1]] = match[2];
  }
  
  // Extract Open Graph tags
  const ogRegex = /<meta[^>]*property=["']og:([^"']*)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
  while ((match = ogRegex.exec(html)) !== null) {
    metadata[`og:${match[1]}`] = match[2];
  }
  
  return metadata;
}