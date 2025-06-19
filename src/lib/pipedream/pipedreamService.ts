
import { PipedreamApp } from "@/types/pipedream";

// Comprehensive list of Pipedream apps
const PIPEDREAM_APPS: PipedreamApp[] = [
  // Social Media & Communication
  { name: "Facebook Graph API", name_slug: "facebook", auth_type: "oauth", categories: ["social-media"], description: "Connect to Facebook's Graph API for social media management." },
  { name: "Instagram", name_slug: "instagram", auth_type: "oauth", categories: ["social-media"], description: "Manage Instagram posts, stories, and engagement." },
  { name: "Twitter", name_slug: "twitter", auth_type: "oauth", categories: ["social-media"], description: "Automate Twitter posts and engagement." },
  { name: "LinkedIn", name_slug: "linkedin", auth_type: "oauth", categories: ["social-media"], description: "Professional networking and content management." },
  { name: "TikTok", name_slug: "tiktok", auth_type: "oauth", categories: ["social-media"], description: "Create and manage TikTok content." },
  { name: "Discord", name_slug: "discord", auth_type: "oauth", categories: ["communication"], description: "Discord bot and server management." },
  { name: "Slack", name_slug: "slack", auth_type: "oauth", categories: ["communication"], description: "Team communication and workflow automation." },
  { name: "Microsoft Teams", name_slug: "microsoft_teams", auth_type: "oauth", categories: ["communication"], description: "Microsoft Teams integration and automation." },
  { name: "Zoom", name_slug: "zoom", auth_type: "oauth", categories: ["communication"], description: "Video conferencing and meeting management." },
  { name: "Telegram", name_slug: "telegram", auth_type: "oauth", categories: ["communication"], description: "Telegram bot and messaging automation." },
  { name: "WhatsApp Business", name_slug: "whatsapp", auth_type: "api-key", categories: ["communication"], description: "WhatsApp Business API integration." },
  { name: "Mastodon", name_slug: "mastodon", auth_type: "oauth", categories: ["social-media"], description: "Decentralized social networking platform." },
  { name: "Bluesky", name_slug: "bluesky", auth_type: "oauth", categories: ["social-media"], description: "Decentralized social media platform." },

  // Email & Marketing
  { name: "Gmail", name_slug: "gmail", auth_type: "oauth", categories: ["email"], description: "Google Gmail integration for email automation." },
  { name: "Outlook", name_slug: "outlook", auth_type: "oauth", categories: ["email"], description: "Microsoft Outlook email management." },
  { name: "Mailchimp", name_slug: "mailchimp", auth_type: "oauth", categories: ["marketing"], description: "Email marketing and automation platform." },
  { name: "SendGrid", name_slug: "sendgrid", auth_type: "api-key", categories: ["email"], description: "Email delivery and marketing platform." },
  { name: "Mailgun", name_slug: "mailgun", auth_type: "api-key", categories: ["email"], description: "Email API service for developers." },
  { name: "ConvertKit", name_slug: "convertkit", auth_type: "api-key", categories: ["marketing"], description: "Email marketing for creators." },
  { name: "ActiveCampaign", name_slug: "activecampaign", auth_type: "oauth", categories: ["marketing"], description: "Customer experience automation platform." },
  { name: "Campaign Monitor", name_slug: "campaign_monitor", auth_type: "oauth", categories: ["marketing"], description: "Email marketing and automation." },
  { name: "GetResponse", name_slug: "getresponse", auth_type: "oauth", categories: ["marketing"], description: "Email marketing and online campaigns." },
  { name: "Klaviyo", name_slug: "klaviyo", auth_type: "api-key", categories: ["marketing"], description: "Email and SMS marketing platform." },

  // CRM & Sales
  { name: "Salesforce", name_slug: "salesforce", auth_type: "oauth", categories: ["crm"], description: "World's leading CRM platform." },
  { name: "HubSpot", name_slug: "hubspot", auth_type: "oauth", categories: ["crm"], description: "Inbound marketing and sales platform." },
  { name: "Pipedrive", name_slug: "pipedrive", auth_type: "oauth", categories: ["crm"], description: "Sales CRM and pipeline management." },
  { name: "Zoho CRM", name_slug: "zoho_crm", auth_type: "oauth", categories: ["crm"], description: "Customer relationship management solution." },
  { name: "Freshworks CRM", name_slug: "freshworks_crm", auth_type: "oauth", categories: ["crm"], description: "Modern CRM for sales teams." },
  { name: "Insightly", name_slug: "insightly", auth_type: "oauth", categories: ["crm"], description: "CRM and project management platform." },
  { name: "Copper", name_slug: "copper", auth_type: "oauth", categories: ["crm"], description: "CRM built for Google Workspace." },

  // Productivity & Project Management
  { name: "Notion", name_slug: "notion", auth_type: "oauth", categories: ["productivity"], description: "All-in-one workspace for notes and tasks." },
  { name: "Airtable", name_slug: "airtable", auth_type: "oauth", categories: ["productivity"], description: "Spreadsheet-database hybrid platform." },
  { name: "Trello", name_slug: "trello", auth_type: "oauth", categories: ["productivity"], description: "Visual project management with boards." },
  { name: "Asana", name_slug: "asana", auth_type: "oauth", categories: ["productivity"], description: "Team collaboration and project management." },
  { name: "Monday.com", name_slug: "monday", auth_type: "oauth", categories: ["productivity"], description: "Work operating system for teams." },
  { name: "ClickUp", name_slug: "clickup", auth_type: "oauth", categories: ["productivity"], description: "All-in-one productivity platform." },
  { name: "Jira", name_slug: "jira", auth_type: "oauth", categories: ["productivity"], description: "Issue tracking and project management." },
  { name: "Linear", name_slug: "linear", auth_type: "oauth", categories: ["productivity"], description: "Modern software development workflow." },
  { name: "Height", name_slug: "height", auth_type: "oauth", categories: ["productivity"], description: "Autonomous project management tool." },

  // AI & Machine Learning
  { name: "OpenAI", name_slug: "openai", auth_type: "api-key", categories: ["ai-tools"], description: "GPT models and AI-powered applications." },
  { name: "Anthropic", name_slug: "anthropic", auth_type: "api-key", categories: ["ai-tools"], description: "Claude AI assistant and language models." },
  { name: "Google AI", name_slug: "google_ai", auth_type: "api-key", categories: ["ai-tools"], description: "Google's AI and machine learning services." },
  { name: "Cohere", name_slug: "cohere", auth_type: "api-key", categories: ["ai-tools"], description: "Natural language processing platform." },
  { name: "Hugging Face", name_slug: "huggingface", auth_type: "api-key", categories: ["ai-tools"], description: "Open-source AI model hub." },
  { name: "Replicate", name_slug: "replicate", auth_type: "api-key", categories: ["ai-tools"], description: "Run AI models in the cloud." },
  { name: "Stability AI", name_slug: "stability_ai", auth_type: "api-key", categories: ["ai-tools"], description: "Stable Diffusion and image generation." },
  { name: "ElevenLabs", name_slug: "elevenlabs", auth_type: "api-key", categories: ["ai-tools"], description: "AI voice synthesis and cloning." },

  // Development & DevOps
  { name: "GitHub", name_slug: "github", auth_type: "oauth", categories: ["developer-tools"], description: "Code hosting and collaboration platform." },
  { name: "GitLab", name_slug: "gitlab", auth_type: "oauth", categories: ["developer-tools"], description: "DevOps platform and code repository." },
  { name: "Bitbucket", name_slug: "bitbucket", auth_type: "oauth", categories: ["developer-tools"], description: "Git code management and collaboration." },
  { name: "Vercel", name_slug: "vercel", auth_type: "oauth", categories: ["developer-tools"], description: "Frontend deployment and hosting." },
  { name: "Netlify", name_slug: "netlify", auth_type: "oauth", categories: ["developer-tools"], description: "Modern web development platform." },
  { name: "Heroku", name_slug: "heroku", auth_type: "oauth", categories: ["developer-tools"], description: "Cloud platform for application deployment." },
  { name: "AWS", name_slug: "aws", auth_type: "api-key", categories: ["developer-tools"], description: "Amazon Web Services cloud platform." },
  { name: "Google Cloud", name_slug: "google_cloud", auth_type: "oauth", categories: ["developer-tools"], description: "Google Cloud Platform services." },
  { name: "Azure", name_slug: "azure", auth_type: "oauth", categories: ["developer-tools"], description: "Microsoft Azure cloud services." },

  // E-commerce & Payments
  { name: "Shopify", name_slug: "shopify", auth_type: "oauth", categories: ["ecommerce"], description: "E-commerce platform for online stores." },
  { name: "WooCommerce", name_slug: "woocommerce", auth_type: "api-key", categories: ["ecommerce"], description: "WordPress e-commerce plugin." },
  { name: "BigCommerce", name_slug: "bigcommerce", auth_type: "oauth", categories: ["ecommerce"], description: "Enterprise e-commerce platform." },
  { name: "Stripe", name_slug: "stripe", auth_type: "api-key", categories: ["payment"], description: "Online payment processing platform." },
  { name: "PayPal", name_slug: "paypal", auth_type: "oauth", categories: ["payment"], description: "Digital payment and money transfer." },
  { name: "Square", name_slug: "square", auth_type: "oauth", categories: ["payment"], description: "Point of sale and payment processing." },

  // File Storage & Documents
  { name: "Google Drive", name_slug: "google_drive", auth_type: "oauth", categories: ["file-storage"], description: "Cloud storage and file sharing." },
  { name: "Dropbox", name_slug: "dropbox", auth_type: "oauth", categories: ["file-storage"], description: "Cloud storage and file synchronization." },
  { name: "OneDrive", name_slug: "onedrive", auth_type: "oauth", categories: ["file-storage"], description: "Microsoft's cloud storage service." },
  { name: "Box", name_slug: "box", auth_type: "oauth", categories: ["file-storage"], description: "Enterprise content management platform." },
  { name: "AWS S3", name_slug: "aws_s3", auth_type: "api-key", categories: ["file-storage"], description: "Amazon's object storage service." },

  // Analytics & Monitoring
  { name: "Google Analytics", name_slug: "google_analytics", auth_type: "oauth", categories: ["analytics"], description: "Web analytics and reporting platform." },
  { name: "Mixpanel", name_slug: "mixpanel", auth_type: "api-key", categories: ["analytics"], description: "Product analytics platform." },
  { name: "Amplitude", name_slug: "amplitude", auth_type: "api-key", categories: ["analytics"], description: "Digital analytics platform." },
  { name: "Hotjar", name_slug: "hotjar", auth_type: "api-key", categories: ["analytics"], description: "Website heatmaps and user behavior." },
  { name: "New Relic", name_slug: "new_relic", auth_type: "api-key", categories: ["monitoring"], description: "Application performance monitoring." },
  { name: "Datadog", name_slug: "datadog", auth_type: "api-key", categories: ["monitoring"], description: "Infrastructure monitoring and analytics." },

  // Forms & Surveys
  { name: "Typeform", name_slug: "typeform", auth_type: "oauth", categories: ["forms"], description: "Interactive forms and surveys." },
  { name: "Google Forms", name_slug: "google_forms", auth_type: "oauth", categories: ["forms"], description: "Simple form creation and data collection." },
  { name: "JotForm", name_slug: "jotform", auth_type: "api-key", categories: ["forms"], description: "Online form builder and data collection." },
  { name: "SurveyMonkey", name_slug: "surveymonkey", auth_type: "oauth", categories: ["forms"], description: "Online survey and questionnaire platform." },
  { name: "Formstack", name_slug: "formstack", auth_type: "oauth", categories: ["forms"], description: "Digital form and document workflow." },

  // Calendar & Scheduling
  { name: "Google Calendar", name_slug: "google_calendar", auth_type: "oauth", categories: ["calendar"], description: "Calendar and event management." },
  { name: "Outlook Calendar", name_slug: "outlook_calendar", auth_type: "oauth", categories: ["calendar"], description: "Microsoft calendar and scheduling." },
  { name: "Calendly", name_slug: "calendly", auth_type: "oauth", categories: ["calendar"], description: "Automated scheduling and booking." },
  { name: "Acuity Scheduling", name_slug: "acuity", auth_type: "oauth", categories: ["calendar"], description: "Online appointment scheduling." },
  { name: "Cal.com", name_slug: "cal_com", auth_type: "oauth", categories: ["calendar"], description: "Open-source scheduling platform." },

  // Customer Support
  { name: "Zendesk", name_slug: "zendesk", auth_type: "oauth", categories: ["support"], description: "Customer service and support platform." },
  { name: "Freshdesk", name_slug: "freshdesk", auth_type: "oauth", categories: ["support"], description: "Cloud-based customer support software." },
  { name: "Intercom", name_slug: "intercom", auth_type: "oauth", categories: ["support"], description: "Customer messaging and support platform." },
  { name: "Help Scout", name_slug: "help_scout", auth_type: "oauth", categories: ["support"], description: "Help desk software for customer support." },
  { name: "Crisp", name_slug: "crisp", auth_type: "oauth", categories: ["support"], description: "Customer messaging and support platform." },

  // Additional Popular Apps
  { name: "123FormBuilder", name_slug: "123formbuilder", auth_type: "api-key", categories: ["forms"], description: "Online form builder with advanced features." },
  { name: "Ably", name_slug: "ably", auth_type: "api-key", categories: ["developer-tools"], description: "Real-time messaging and data synchronization." },
  { name: "Abstract", name_slug: "abstract", auth_type: "api-key", categories: ["developer-tools"], description: "Email verification and IP geolocation APIs." },
  { name: "Accuranker", name_slug: "accuranker", auth_type: "api-key", categories: ["analytics"], description: "SEO rank tracking and keyword monitoring." },
  { name: "Acquire", name_slug: "acquire", auth_type: "api-key", categories: ["support"], description: "Customer engagement and support platform." },
  { name: "Action Network", name_slug: "action_network", auth_type: "oauth", categories: ["activism"], description: "Digital organizing and advocacy platform." },
  { name: "actiTIME", name_slug: "actitime", auth_type: "api-key", categories: ["productivity"], description: "Time tracking and project management." },
  { name: "Adobe Acrobat Sign", name_slug: "adobe_sign", auth_type: "oauth", categories: ["documents"], description: "Electronic signature and document workflow." },
  { name: "Adobe Photoshop", name_slug: "adobe_photoshop", auth_type: "oauth", categories: ["design"], description: "Professional image editing and design." },
  { name: "AfterShip", name_slug: "aftership", auth_type: "api-key", categories: ["ecommerce"], description: "Package tracking and delivery notifications." },
  { name: "Agile CRM", name_slug: "agile_crm", auth_type: "oauth", categories: ["crm"], description: "All-in-one CRM with sales and marketing." },
  { name: "Ahrefs", name_slug: "ahrefs", auth_type: "api-key", categories: ["analytics"], description: "SEO toolset for keyword research and analysis." },
  { name: "Aircall", name_slug: "aircall", auth_type: "oauth", categories: ["communication"], description: "Cloud-based phone system for teams." },
  { name: "BambooHR", name_slug: "bamboohr", auth_type: "oauth", categories: ["hr"], description: "Human resources management system." },
  { name: "Bannerbear", name_slug: "bannerbear", auth_type: "api-key", categories: ["design"], description: "Auto-generate images and videos from templates." },
  { name: "Basecamp", name_slug: "basecamp", auth_type: "oauth", categories: ["productivity"], description: "Project management and team collaboration." },
  { name: "Beehiiv", name_slug: "beehiiv", auth_type: "api-key", categories: ["marketing"], description: "Newsletter platform for creators and publishers." },
  { name: "Benchmark Email", name_slug: "benchmark_email", auth_type: "oauth", categories: ["marketing"], description: "Email marketing and automation platform." },
  { name: "Better Proposals", name_slug: "better_proposals", auth_type: "oauth", categories: ["business"], description: "Proposal creation and management software." },
  { name: "BigCommerce", name_slug: "bigcommerce", auth_type: "oauth", categories: ["ecommerce"], description: "Enterprise e-commerce platform and solutions." },
  { name: "Bitdefender", name_slug: "bitdefender", auth_type: "api-key", categories: ["security"], description: "Cybersecurity and endpoint protection." },
  { name: "Bloomerang", name_slug: "bloomerang", auth_type: "oauth", categories: ["nonprofit"], description: "Donor management and fundraising software." },
  { name: "Calendly", name_slug: "calendly", auth_type: "oauth", categories: ["calendar"], description: "Automated scheduling and appointment booking." },
  { name: "Canva", name_slug: "canva", auth_type: "oauth", categories: ["design"], description: "Graphic design and visual content creation." },
  { name: "Capsule", name_slug: "capsule", auth_type: "oauth", categories: ["crm"], description: "Simple online CRM for small businesses." },
  { name: "Carbone", name_slug: "carbone", auth_type: "api-key", categories: ["documents"], description: "Document generation and template engine." },
  { name: "Chargebee", name_slug: "chargebee", auth_type: "oauth", categories: ["payment"], description: "Subscription billing and revenue management." },
  { name: "ChatBot", name_slug: "chatbot", auth_type: "api-key", categories: ["ai-tools"], description: "AI chatbot platform for customer service." },
  { name: "Chatra", name_slug: "chatra", auth_type: "oauth", categories: ["support"], description: "Live chat software for websites." },
  { name: "ClickFunnels", name_slug: "clickfunnels", auth_type: "oauth", categories: ["marketing"], description: "Sales funnel builder and marketing platform." },
  { name: "Clockify", name_slug: "clockify", auth_type: "api-key", categories: ["productivity"], description: "Time tracking and project management tool." },
  { name: "CloudFlare", name_slug: "cloudflare", auth_type: "api-key", categories: ["developer-tools"], description: "Web performance and security platform." },
  { name: "Coinbase", name_slug: "coinbase", auth_type: "oauth", categories: ["finance"], description: "Cryptocurrency exchange and wallet platform." },
  { name: "Copper", name_slug: "copper", auth_type: "oauth", categories: ["crm"], description: "CRM designed for Google Workspace users." },
  { name: "Coursera", name_slug: "coursera", auth_type: "oauth", categories: ["education"], description: "Online learning and professional development." },
  { name: "Crehana", name_slug: "crehana", auth_type: "oauth", categories: ["education"], description: "Creative and professional skills platform." },
  { name: "Crisp", name_slug: "crisp", auth_type: "oauth", categories: ["support"], description: "Customer messaging and live chat platform." },
  { name: "Databox", name_slug: "databox", auth_type: "oauth", categories: ["analytics"], description: "Business analytics and KPI dashboard." },
  { name: "DeepL", name_slug: "deepl", auth_type: "api-key", categories: ["ai-tools"], description: "AI-powered translation service." },
  { name: "Demio", name_slug: "demio", auth_type: "oauth", categories: ["communication"], description: "Webinar and online event platform." },
  { name: "Deputy", name_slug: "deputy", auth_type: "oauth", categories: ["hr"], description: "Employee scheduling and workforce management." },
  { name: "Dev.to", name_slug: "dev_to", auth_type: "api-key", categories: ["developer-tools"], description: "Developer community and blogging platform." },
  { name: "Dialpad", name_slug: "dialpad", auth_type: "oauth", categories: ["communication"], description: "Business phone system and communications." },
  { name: "DigiCert", name_slug: "digicert", auth_type: "api-key", categories: ["security"], description: "SSL certificates and digital security solutions." },
  { name: "Discord", name_slug: "discord", auth_type: "oauth", categories: ["communication"], description: "Voice, video, and text communication for communities." },
  { name: "DocuSign", name_slug: "docusign", auth_type: "oauth", categories: ["documents"], description: "Electronic signature and document management." },
  { name: "Drift", name_slug: "drift", auth_type: "oauth", categories: ["marketing"], description: "Conversational marketing and sales platform." },
  { name: "Dropbox", name_slug: "dropbox", auth_type: "oauth", categories: ["file-storage"], description: "Cloud storage and file sharing platform." },
  { name: "Ecwid", name_slug: "ecwid", auth_type: "oauth", categories: ["ecommerce"], description: "E-commerce platform for small businesses." },
  { name: "Elastic Email", name_slug: "elastic_email", auth_type: "api-key", categories: ["email"], description: "Email delivery and marketing automation." },
  { name: "Eventbrite", name_slug: "eventbrite", auth_type: "oauth", categories: ["events"], description: "Event management and ticketing platform." },
  { name: "Facebook Ads", name_slug: "facebook_ads", auth_type: "oauth", categories: ["marketing"], description: "Facebook advertising and campaign management." },
  { name: "Figma", name_slug: "figma", auth_type: "oauth", categories: ["design"], description: "Collaborative design and prototyping tool." },
  { name: "Firebase", name_slug: "firebase", auth_type: "oauth", categories: ["developer-tools"], description: "Google's mobile and web app development platform." },
  { name: "Fireflies", name_slug: "fireflies", auth_type: "oauth", categories: ["productivity"], description: "AI meeting assistant and note-taking tool." },
  { name: "Flodesk", name_slug: "flodesk", auth_type: "oauth", categories: ["marketing"], description: "Email marketing platform for creatives." },
  { name: "FreshBooks", name_slug: "freshbooks", auth_type: "oauth", categories: ["accounting"], description: "Accounting and invoicing software for small business." },
  { name: "Ghost", name_slug: "ghost", auth_type: "api-key", categories: ["publishing"], description: "Professional publishing platform and CMS." },
  { name: "GitLab", name_slug: "gitlab", auth_type: "oauth", categories: ["developer-tools"], description: "Complete DevOps platform and code repository." },
  { name: "Gong", name_slug: "gong", auth_type: "oauth", categories: ["sales"], description: "Revenue intelligence and sales analytics platform." },
  { name: "Google Ads", name_slug: "google_ads", auth_type: "oauth", categories: ["marketing"], description: "Google's online advertising platform." },
  { name: "Google Sheets", name_slug: "google_sheets", auth_type: "oauth", categories: ["productivity"], description: "Cloud-based spreadsheet application." },
  { name: "Harvest", name_slug: "harvest", auth_type: "oauth", categories: ["productivity"], description: "Time tracking and invoicing for teams." },
  { name: "Hashnode", name_slug: "hashnode", auth_type: "oauth", categories: ["publishing"], description: "Blogging platform for developers." },
  { name: "Help Scout", name_slug: "help_scout", auth_type: "oauth", categories: ["support"], description: "Customer service and help desk software." },
  { name: "Heroku", name_slug: "heroku", auth_type: "oauth", categories: ["developer-tools"], description: "Cloud platform for deploying applications." },
  { name: "HubSpot", name_slug: "hubspot", auth_type: "oauth", categories: ["crm"], description: "Inbound marketing, sales, and service platform." },
  { name: "IFTTT", name_slug: "ifttt", auth_type: "oauth", categories: ["automation"], description: "Automation platform connecting apps and devices." },
  { name: "Infusionsoft", name_slug: "infusionsoft", auth_type: "oauth", categories: ["marketing"], description: "CRM and marketing automation platform." },
  { name: "Instagram", name_slug: "instagram", auth_type: "oauth", categories: ["social-media"], description: "Photo and video sharing social network." },
  { name: "Integromat", name_slug: "integromat", auth_type: "oauth", categories: ["automation"], description: "Advanced automation platform for connecting apps." },
  { name: "Intercom", name_slug: "intercom", auth_type: "oauth", categories: ["support"], description: "Customer messaging and support platform." },
  { name: "JotForm", name_slug: "jotform", auth_type: "api-key", categories: ["forms"], description: "Online form builder and data collection tool." },
  { name: "Klaviyo", name_slug: "klaviyo", auth_type: "api-key", categories: ["marketing"], description: "Email marketing platform for e-commerce." },
  { name: "LastPass", name_slug: "lastpass", auth_type: "oauth", categories: ["security"], description: "Password manager and digital vault." },
  { name: "LinkedIn Ads", name_slug: "linkedin_ads", auth_type: "oauth", categories: ["marketing"], description: "Professional advertising platform." },
  { name: "Mailchimp", name_slug: "mailchimp", auth_type: "oauth", categories: ["marketing"], description: "Email marketing and automation platform." },
  { name: "Make", name_slug: "make", auth_type: "oauth", categories: ["automation"], description: "Visual platform for creating automated workflows." },
  { name: "Miro", name_slug: "miro", auth_type: "oauth", categories: ["productivity"], description: "Online collaborative whiteboard platform." },
  { name: "Notion", name_slug: "notion", auth_type: "oauth", categories: ["productivity"], description: "All-in-one workspace for notes, tasks, and databases." },
  { name: "Okta", name_slug: "okta", auth_type: "oauth", categories: ["security"], description: "Identity and access management platform." },
  { name: "Pagerduty", name_slug: "pagerduty", auth_type: "oauth", categories: ["monitoring"], description: "Digital operations management platform." },
  { name: "Pandadoc", name_slug: "pandadoc", auth_type: "oauth", categories: ["documents"], description: "Document automation and e-signature platform." },
  { name: "Paypal", name_slug: "paypal", auth_type: "oauth", categories: ["payment"], description: "Digital payment and money transfer service." },
  { name: "Pinterest", name_slug: "pinterest", auth_type: "oauth", categories: ["social-media"], description: "Visual discovery and idea platform." },
  { name: "Pipedrive", name_slug: "pipedrive", auth_type: "oauth", categories: ["crm"], description: "Sales CRM and pipeline management tool." },
  { name: "Plaid", name_slug: "plaid", auth_type: "oauth", categories: ["finance"], description: "Financial data network and API platform." },
  { name: "QuickBooks", name_slug: "quickbooks", auth_type: "oauth", categories: ["accounting"], description: "Accounting software for small businesses." },
  { name: "Reddit", name_slug: "reddit", auth_type: "oauth", categories: ["social-media"], description: "Social news aggregation and discussion platform." },
  { name: "Salesforce", name_slug: "salesforce", auth_type: "oauth", categories: ["crm"], description: "Leading cloud-based CRM platform." },
  { name: "Segment", name_slug: "segment", auth_type: "oauth", categories: ["analytics"], description: "Customer data platform and analytics." },
  { name: "Sendbird", name_slug: "sendbird", auth_type: "api-key", categories: ["communication"], description: "Chat and messaging API platform." },
  { name: "Shopify", name_slug: "shopify", auth_type: "oauth", categories: ["ecommerce"], description: "E-commerce platform for online stores." },
  { name: "Slack", name_slug: "slack", auth_type: "oauth", categories: ["communication"], description: "Team collaboration and messaging platform." },
  { name: "Snowflake", name_slug: "snowflake", auth_type: "oauth", categories: ["data"], description: "Cloud data platform and warehouse." },
  { name: "Square", name_slug: "square", auth_type: "oauth", categories: ["payment"], description: "Payment processing and point-of-sale system." },
  { name: "Stripe", name_slug: "stripe", auth_type: "api-key", categories: ["payment"], description: "Online payment processing platform." },
  { name: "SurveyMonkey", name_slug: "surveymonkey", auth_type: "oauth", categories: ["forms"], description: "Online survey and questionnaire platform." },
  { name: "Tableau", name_slug: "tableau", auth_type: "oauth", categories: ["analytics"], description: "Data visualization and business intelligence." },
  { name: "Telegram", name_slug: "telegram", auth_type: "oauth", categories: ["communication"], description: "Cloud-based instant messaging platform." },
  { name: "Todoist", name_slug: "todoist", auth_type: "oauth", categories: ["productivity"], description: "Task management and productivity application." },
  { name: "Trello", name_slug: "trello", auth_type: "oauth", categories: ["productivity"], description: "Visual project management with boards and cards." },
  { name: "Twilio", name_slug: "twilio", auth_type: "api-key", categories: ["communication"], description: "Cloud communications platform for messaging." },
  { name: "Twitter", name_slug: "twitter", auth_type: "oauth", categories: ["social-media"], description: "Real-time information and social networking." },
  { name: "Typeform", name_slug: "typeform", auth_type: "oauth", categories: ["forms"], description: "Interactive forms and survey platform." },
  { name: "Uber", name_slug: "uber", auth_type: "oauth", categories: ["transportation"], description: "Ride-sharing and delivery platform." },
  { name: "Vimeo", name_slug: "vimeo", auth_type: "oauth", categories: ["video"], description: "Video hosting and streaming platform." },
  { name: "WooCommerce", name_slug: "woocommerce", auth_type: "api-key", categories: ["ecommerce"], description: "WordPress e-commerce plugin and platform." },
  { name: "WordPress", name_slug: "wordpress", auth_type: "oauth", categories: ["publishing"], description: "Content management system and blogging platform." },
  { name: "Xero", name_slug: "xero", auth_type: "oauth", categories: ["accounting"], description: "Cloud-based accounting software for small business." },
  { name: "YouTube", name_slug: "youtube", auth_type: "oauth", categories: ["video"], description: "Video sharing and streaming platform." },
  { name: "Zapier", name_slug: "zapier", auth_type: "oauth", categories: ["automation"], description: "Automation platform connecting web applications." },
  { name: "Zendesk", name_slug: "zendesk", auth_type: "oauth", categories: ["support"], description: "Customer service and support ticketing system." },
  { name: "Zoom", name_slug: "zoom", auth_type: "oauth", categories: ["communication"], description: "Video conferencing and online meeting platform." },
  { name: "Zoho", name_slug: "zoho", auth_type: "oauth", categories: ["productivity"], description: "Suite of business and productivity applications." }
];

// Cache for performance
let cachedApps: PipedreamApp[] | null = null;

export const fetchPipedreamApps = async (): Promise<PipedreamApp[]> => {
  // Simulate API delay for realism
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (!cachedApps) {
    cachedApps = PIPEDREAM_APPS;
  }
  
  return cachedApps;
};

export const searchPipedreamApps = async (query: string): Promise<PipedreamApp[]> => {
  const allApps = await fetchPipedreamApps();
  
  if (!query.trim()) {
    return allApps;
  }
  
  const searchTerm = query.toLowerCase();
  return allApps.filter(app => 
    app.name.toLowerCase().includes(searchTerm) ||
    app.description.toLowerCase().includes(searchTerm) ||
    app.categories.some(cat => cat.toLowerCase().includes(searchTerm)) ||
    app.name_slug.toLowerCase().includes(searchTerm)
  );
};

export const getAppsByCategory = async (category: string): Promise<PipedreamApp[]> => {
  const allApps = await fetchPipedreamApps();
  return allApps.filter(app => app.categories.includes(category));
};

export const getAppBySlug = async (slug: string): Promise<PipedreamApp | null> => {
  const allApps = await fetchPipedreamApps();
  return allApps.find(app => app.name_slug === slug) || null;
};

export const getAvailableCategories = async (): Promise<string[]> => {
  const allApps = await fetchPipedreamApps();
  const categories = new Set<string>();
  
  allApps.forEach(app => {
    app.categories.forEach(cat => categories.add(cat));
  });
  
  return Array.from(categories).sort();
};

// Connection management for Pipedream apps
export const connectToPipedreamApp = async (
  appSlug: string, 
  credentials: Record<string, string>
): Promise<boolean> => {
  try {
    console.log(`Connecting to Pipedream app: ${appSlug}`, credentials);
    
    // In a real implementation, this would:
    // 1. Use Pipedream's OAuth flow or API key validation
    // 2. Store connection securely
    // 3. Test the connection
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, always succeed
    return true;
  } catch (error) {
    console.error(`Failed to connect to ${appSlug}:`, error);
    return false;
  }
};

export const disconnectFromPipedreamApp = async (appSlug: string): Promise<boolean> => {
  try {
    console.log(`Disconnecting from Pipedream app: ${appSlug}`);
    
    // In a real implementation, this would:
    // 1. Revoke tokens/credentials
    // 2. Clean up stored connection data
    // 3. Notify the app if needed
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    console.error(`Failed to disconnect from ${appSlug}:`, error);
    return false;
  }
};

export const testPipedreamConnection = async (appSlug: string): Promise<boolean> => {
  try {
    console.log(`Testing connection to Pipedream app: ${appSlug}`);
    
    // In a real implementation, this would make a test API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate 90% success rate for demo
    return Math.random() > 0.1;
  } catch (error) {
    console.error(`Connection test failed for ${appSlug}:`, error);
    return false;
  }
};

// Execution capabilities for connected apps
export const executePipedreamAction = async (
  appSlug: string,
  action: string,
  parameters: Record<string, any>
): Promise<any> => {
  try {
    console.log(`Executing Pipedream action: ${appSlug}.${action}`, parameters);
    
    // In a real implementation, this would:
    // 1. Use Pipedream's execution API
    // 2. Handle different action types
    // 3. Return structured results
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock successful result
    return {
      success: true,
      data: {
        action,
        app: appSlug,
        executedAt: new Date().toISOString(),
        parameters,
        result: `Successfully executed ${action} on ${appSlug}`
      }
    };
  } catch (error) {
    console.error(`Failed to execute action ${action} on ${appSlug}:`, error);
    throw error;
  }
};
