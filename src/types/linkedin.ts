
export interface LinkedInTokens {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope: string;
  token_type: string;
}

export interface LinkedInProfile {
  id: string;
  firstName: {
    localized: {
      [key: string]: string;
    };
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  lastName: {
    localized: {
      [key: string]: string;
    };
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  profilePicture?: {
    displayImage: string;
  };
  vanityName?: string;
}

export interface LinkedInEmail {
  elements: Array<{
    'handle~': {
      emailAddress: string;
    };
    handle: string;
  }>;
}

export interface LinkedInPost {
  author: string;
  lifecycleState: 'PUBLISHED' | 'DRAFT';
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string;
      };
      shareMediaCategory: 'NONE' | 'IMAGE' | 'VIDEO' | 'ARTICLE';
      media?: Array<{
        status: string;
        description: {
          text: string;
        };
        media: string;
        title: {
          text: string;
        };
      }>;
    };
  };
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' | 'CONNECTIONS';
  };
}

export interface LinkedInApiResponse {
  data?: any;
  error?: {
    message: string;
    status: number;
  };
  paging?: {
    count: number;
    start: number;
    total?: number;
  };
}

export interface LinkedInOrganization {
  id: string;
  name: {
    localized: {
      [key: string]: string;
    };
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  vanityName: string;
  description?: {
    localized: {
      [key: string]: string;
    };
  };
  logoV2?: {
    original: string;
  };
}
