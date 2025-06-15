
import { Platform } from "@/types/platform";
import { ComingSoonSection } from "./ComingSoonSection";
import { GitHubOAuthSection } from "./GitHubOAuthSection";
import { TwitterOAuthSection } from "./TwitterOAuthSection";
import { FacebookOAuthSection } from "./FacebookOAuthSection";
import { InstagramOAuthSection } from "./InstagramOAuthSection";
import { LinkedInOAuthSection } from "./LinkedInOAuthSection";
import { TikTokOAuthSection } from "./TikTokOAuthSection";
import { KooOAuthSection } from "./KooOAuthSection";
import { ShareChatOAuthSection } from "./ShareChatOAuthSection";
import { GmailOAuthSection } from "./GmailOAuthSection";
import { PlatformAuthFields } from "./PlatformAuthFields";

interface AuthFieldsRendererProps {
  platform: Platform;
  isSupported: boolean;
  credentials: Record<string, string>;
  setCredentials: (credentials: Record<string, string>) => void;
}

export function AuthFieldsRenderer({ platform, isSupported, credentials, setCredentials }: AuthFieldsRendererProps) {
  if (!isSupported) {
    return <ComingSoonSection platformName={platform.name} />;
  }

  switch (platform.id) {
    case "github":
      return <GitHubOAuthSection credentials={credentials} setCredentials={setCredentials} />;
    case "gmail":
      return <GmailOAuthSection credentials={credentials} setCredentials={setCredentials} />;
    case "twitter":
      return <TwitterOAuthSection credentials={credentials} setCredentials={setCredentials} />;
    case "facebook":
      return <FacebookOAuthSection credentials={credentials} setCredentials={setCredentials} />;
    case "instagram":
      return <InstagramOAuthSection credentials={credentials} setCredentials={setCredentials} />;
    case "linkedin":
      return <LinkedInOAuthSection credentials={credentials} setCredentials={setCredentials} />;
    case "tiktok":
      return <TikTokOAuthSection credentials={credentials} setCredentials={setCredentials} />;
    case "koo":
      return <KooOAuthSection credentials={credentials} setCredentials={setCredentials} />;
    case "sharechat":
      return <ShareChatOAuthSection credentials={credentials} setCredentials={setCredentials} />;
    default:
      return <PlatformAuthFields platform={platform} credentials={credentials} setCredentials={setCredentials} />;
  }
}
