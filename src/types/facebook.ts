
export interface FacebookTokens {
  access_token: string;
  expires_in?: number;
  token_type: string;
}

export interface FacebookPageToken {
  access_token: string;
  id: string;
  name: string;
  category: string;
  tasks: string[];
}

export interface FacebookApiResponse {
  data?: any;
  error?: {
    message: string;
    type: string;
    code: number;
  };
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  from: {
    name: string;
    id: string;
  };
  likes?: {
    data: any[];
    summary: {
      total_count: number;
    };
  };
  comments?: {
    data: any[];
    summary: {
      total_count: number;
    };
  };
}
