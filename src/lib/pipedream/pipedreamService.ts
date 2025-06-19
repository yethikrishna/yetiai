
import { PipedreamApp } from "@/types/pipedream";

// Mock data for development - in production this would fetch from Pipedream API
export const fetchPipedreamApps = async (): Promise<PipedreamApp[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      name: "GitHub",
      name_slug: "github",
      auth_type: "oauth",
      categories: ["developer-tools"],
      description: "The complete developer platform to build, scale, and deliver secure software.",
      custom_fields_json: null
    },
    {
      name: "Gmail",
      name_slug: "gmail", 
      auth_type: "oauth",
      categories: ["communication"],
      description: "Email service developed by Google.",
      custom_fields_json: null
    },
    {
      name: "Slack",
      name_slug: "slack",
      auth_type: "oauth", 
      categories: ["communication"],
      description: "Business communication platform.",
      custom_fields_json: null
    },
    {
      name: "Notion",
      name_slug: "notion",
      auth_type: "oauth",
      categories: ["productivity"],
      description: "All-in-one workspace for notes, tasks, wikis, and databases.",
      custom_fields_json: null
    },
    {
      name: "Google Drive",
      name_slug: "google_drive",
      auth_type: "oauth",
      categories: ["file-storage"],
      description: "Cloud storage service developed by Google.",
      custom_fields_json: null
    },
    {
      name: "Trello",
      name_slug: "trello",
      auth_type: "oauth",
      categories: ["productivity"],
      description: "Visual collaboration tool for organizing projects.",
      custom_fields_json: null
    },
    {
      name: "Asana",
      name_slug: "asana",
      auth_type: "oauth",
      categories: ["productivity"],
      description: "Work management platform for teams.",
      custom_fields_json: null
    },
    {
      name: "Shopify",
      name_slug: "shopify",
      auth_type: "oauth",
      categories: ["ecommerce"],
      description: "Complete commerce platform for online stores.",
      custom_fields_json: null
    },
    {
      name: "Stripe",
      name_slug: "stripe",
      auth_type: "oauth",
      categories: ["payment"],
      description: "Online payment processing platform.",
      custom_fields_json: null
    },
    {
      name: "Airtable",
      name_slug: "airtable",
      auth_type: "oauth",
      categories: ["productivity"],
      description: "Spreadsheet-database hybrid for organizing data.",
      custom_fields_json: null
    },
    {
      name: "HubSpot",
      name_slug: "hubspot",
      auth_type: "oauth",
      categories: ["crm"],
      description: "Customer relationship management platform.",
      custom_fields_json: null
    },
    {
      name: "Salesforce",
      name_slug: "salesforce",
      auth_type: "oauth",
      categories: ["crm"],
      description: "Cloud-based customer relationship management platform.",
      custom_fields_json: null
    },
    {
      name: "Discord",
      name_slug: "discord",
      auth_type: "oauth",
      categories: ["communication"],
      description: "Voice, video and text communication service.",
      custom_fields_json: null
    },
    {
      name: "Twitter",
      name_slug: "twitter",
      auth_type: "oauth",
      categories: ["social-media"],
      description: "Social networking service for sharing short messages.",
      custom_fields_json: null
    },
    {
      name: "YouTube",
      name_slug: "youtube",
      auth_type: "oauth",
      categories: ["social-media"],
      description: "Video sharing platform owned by Google.",
      custom_fields_json: null
    },
    {
      name: "Dropbox",
      name_slug: "dropbox",
      auth_type: "oauth",
      categories: ["file-storage"],
      description: "Cloud storage service for file synchronization.",
      custom_fields_json: null
    },
    {
      name: "Microsoft Teams",
      name_slug: "microsoft_teams",
      auth_type: "oauth",
      categories: ["communication"],
      description: "Business communication platform by Microsoft.",
      custom_fields_json: null
    },
    {
      name: "Zoom",
      name_slug: "zoom",
      auth_type: "oauth",
      categories: ["communication"],
      description: "Video conferencing and online meeting platform.",
      custom_fields_json: null
    },
    {
      name: "Mailchimp",
      name_slug: "mailchimp",
      auth_type: "oauth",
      categories: ["marketing"],
      description: "Email marketing automation platform.",
      custom_fields_json: null
    },
    {
      name: "Twilio",
      name_slug: "twilio",
      auth_type: "oauth",
      categories: ["communication"],
      description: "Cloud communications platform for messaging and voice.",
      custom_fields_json: null
    }
  ];
};

export const searchPipedreamApps = async (query: string): Promise<PipedreamApp[]> => {
  const allApps = await fetchPipedreamApps();
  return allApps.filter(app => 
    app.name.toLowerCase().includes(query.toLowerCase()) ||
    app.description.toLowerCase().includes(query.toLowerCase()) ||
    app.categories.some(cat => cat.toLowerCase().includes(query.toLowerCase()))
  );
};
