
import { socialMediaPlatforms } from "./socialMedia";
import { aiToolsPlatforms } from "./aiTools";
import { entertainmentPlatforms } from "./entertainment";
import { developmentPlatforms } from "./development";
import { emailPlatforms } from "./email";
import { productivityPlatforms } from "./productivity";
import { workplacePlatforms } from "./workplace";
import { websiteBuildersPlatforms } from "./websiteBuilders";
import { fileStoragePlatforms } from "./fileStorage";
import { PlatformCategory } from "@/types/platform";

export const platforms = [
  ...socialMediaPlatforms,
  ...aiToolsPlatforms,
  ...developmentPlatforms,
  ...emailPlatforms,
  ...productivityPlatforms,
  ...workplacePlatforms,
  ...websiteBuildersPlatforms,
  ...fileStoragePlatforms,
  ...entertainmentPlatforms,
];

// List all categories for filter buttons:
export const platformCategories = [
  { id: 'social-media', name: 'Social Media', count: platforms.filter(p => p.category === 'social-media').length },
  { id: 'ai-tools', name: 'AI Tools', count: platforms.filter(p => p.category === 'ai-tools').length },
  { id: 'development', name: 'Development', count: platforms.filter(p => p.category === 'development').length },
  { id: 'email', name: 'Email', count: platforms.filter(p => p.category === 'email').length },
  { id: 'productivity', name: 'Productivity', count: platforms.filter(p => p.category === 'productivity').length },
  { id: 'workplace', name: 'Workplace', count: platforms.filter(p => p.category === 'workplace').length },
  { id: 'website-builders', name: 'Website Builders', count: platforms.filter(p => p.category === 'website-builders').length },
  { id: 'file-storage', name: 'File Storage', count: platforms.filter(p => p.category === 'file-storage').length },
  { id: 'entertainment', name: 'Entertainment', count: platforms.filter(p => p.category === 'entertainment').length }
];
