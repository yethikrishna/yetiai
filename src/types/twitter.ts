
export interface TwitterTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
}

export interface TwitterApiResponse {
  data?: any;
  errors?: Array<{ message: string; code: number }>;
  meta?: any;
}
