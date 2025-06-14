
import { githubHandler } from './githubHandler';
import { gmailHandler } from './gmailHandler';
import { googleDriveHandler } from './googleDriveHandler';
import { openaiHandler } from './openaiHandler';
import { slackHandler } from './slackHandler';
import { notionHandler } from './notionHandler';
import { twitterHandler } from './twitterHandler';

export const platformHandlers = {
  'github': githubHandler,
  'gmail': gmailHandler,
  'google-drive': googleDriveHandler,
  'openai': openaiHandler,
  'slack': slackHandler,
  'notion': notionHandler,
  'twitter': twitterHandler
};

export const isPlatformSupported = (platformId: string): boolean => {
  return platformId in platformHandlers;
};

export const getPlatformHandler = (platformId: string) => {
  return platformHandlers[platformId as keyof typeof platformHandlers];
};
