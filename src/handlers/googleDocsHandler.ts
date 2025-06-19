import { ConnectionConfig } from "@/types/platform";
import { googleOAuthHandler } from "./googleOAuthHandler";

// Types for Google Docs operations
export interface DocumentContent {
  title: string;
  body: any;
}

export interface GoogleDocument {
  documentId: string;
  title: string;
  createdTime?: string;
  modifiedTime?: string;
}

export interface DocumentElement {
  paragraph?: {
    elements: {
      textRun?: {
        content: string;
        textStyle?: any;
      };
      pageBreak?: {};
      horizontalRule?: {};
      footnoteReference?: {};
      [key: string]: any;
    }[];
    paragraphStyle?: any;
  };
  table?: {
    rows: number;
    columns: number;
    tableRows: any[];
  };
  sectionBreak?: any;
  tableOfContents?: any;
  [key: string]: any;
}

export interface DocumentInsertRequest {
  location?: {
    index: number;
    segmentId?: string;
  };
  text?: string;
  endOfSegmentLocation?: {
    segmentId?: string;
  };
}

// Helper function to make authenticated requests to Google Docs API
async function makeDocsApiRequest(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<any> {
  return googleOAuthHandler.makeAuthenticatedRequest(
    `https://docs.googleapis.com/v1${endpoint}`,
    accessToken,
    options
  );
}

export const googleDocsHandler = {
  connect: async (_credentials: Record<string, string>): Promise<boolean> => {
    // Configure the OAuth handler for Docs
    googleOAuthHandler.configure('docs', process.env.VITE_GOOGLE_CLIENT_ID || '');
    googleOAuthHandler.initiateOAuthFlow();
    return new Promise(() => {}); // Resolved after the OAuth2 callback
  },

  test: async (config: ConnectionConfig): Promise<boolean> => {
    console.log("Testing Google Docs connection...");
    try {
      if (!config.credentials.accessToken) {
        return false;
      }

      // Test by fetching documents list through Drive API
      await googleOAuthHandler.makeAuthenticatedRequest(
        'https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application/vnd.google-apps.document%27&fields=files(id,name)&pageSize=1',
        config.credentials.accessToken
      );
      console.log("Google Docs connection test successful");
      return true;
    } catch (error) {
      console.error("Google Docs connection test failed:", error);
      return false;
    }
  },

  disconnect: async (config: ConnectionConfig): Promise<boolean> => {
    console.log("Disconnecting from Google Docs...");
    googleOAuthHandler.clearStoredTokens();
    return true;
  },

  // MCP Functions for Google Docs
  getDocuments: async (config: ConnectionConfig, maxResults: number = 50): Promise<GoogleDocument[]> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log("Fetching Google Docs documents list");
      
      // Using Drive API to list documents
      const response = await googleOAuthHandler.makeAuthenticatedRequest(
        `https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application/vnd.google-apps.document%27&fields=files(id,name,createdTime,modifiedTime)&pageSize=${maxResults}`,
        config.credentials.accessToken
      );

      console.log(`Found ${response.files.length} documents`);
      return response.files.map((file: any) => ({
        documentId: file.id,
        title: file.name,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  getDocument: async (
    config: ConnectionConfig, 
    documentId: string
  ): Promise<DocumentContent> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Fetching document: ${documentId}`);
      
      const response = await makeDocsApiRequest(
        `/documents/${documentId}`,
        config.credentials.accessToken
      );

      console.log(`Successfully retrieved document: ${response.title}`);
      return {
        title: response.title,
        body: response.body
      };
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  createDocument: async (
    config: ConnectionConfig, 
    title: string,
    content?: string
  ): Promise<GoogleDocument> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Creating new document: ${title}`);
      
      // First, create an empty document
      const response = await makeDocsApiRequest(
        `/documents`,
        config.credentials.accessToken,
        {
          method: 'POST',
          body: JSON.stringify({ title })
        }
      );

      // If content is provided, add it to the document
      if (content) {
        await makeDocsApiRequest(
          `/documents/${response.documentId}:batchUpdate`,
          config.credentials.accessToken,
          {
            method: 'POST',
            body: JSON.stringify({
              requests: [
                {
                  insertText: {
                    location: {
                      index: 1 // Insert at beginning of document
                    },
                    text: content
                  }
                }
              ]
            })
          }
        );
      }

      console.log(`Successfully created document with ID: ${response.documentId}`);
      return {
        documentId: response.documentId,
        title: response.title
      };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  updateDocument: async (
    config: ConnectionConfig, 
    documentId: string,
    requests: any[]
  ): Promise<boolean> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Updating document: ${documentId}`);
      
      await makeDocsApiRequest(
        `/documents/${documentId}:batchUpdate`,
        config.credentials.accessToken,
        {
          method: 'POST',
          body: JSON.stringify({ requests })
        }
      );

      console.log(`Successfully updated document`);
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  insertText: async (
    config: ConnectionConfig, 
    documentId: string,
    text: string,
    index: number = 1
  ): Promise<boolean> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Inserting text in document: ${documentId}`);
      
      await makeDocsApiRequest(
        `/documents/${documentId}:batchUpdate`,
        config.credentials.accessToken,
        {
          method: 'POST',
          body: JSON.stringify({
            requests: [
              {
                insertText: {
                  location: {
                    index
                  },
                  text
                }
              }
            ]
          })
        }
      );

      console.log(`Successfully inserted text`);
      return true;
    } catch (error) {
      console.error('Error inserting text:', error);
      throw error;
    }
  },

  replaceText: async (
    config: ConnectionConfig, 
    documentId: string,
    searchText: string,
    replaceText: string
  ): Promise<{ occurrencesChanged: number }> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Replacing text in document: ${documentId}`);
      
      const response = await makeDocsApiRequest(
        `/documents/${documentId}:batchUpdate`,
        config.credentials.accessToken,
        {
          method: 'POST',
          body: JSON.stringify({
            requests: [
              {
                replaceAllText: {
                  containsText: {
                    text: searchText,
                    matchCase: true
                  },
                  replaceText
                }
              }
            ]
          })
        }
      );

      const occurrencesChanged = response.replies[0].replaceAllText.occurrencesChanged || 0;
      console.log(`Successfully replaced ${occurrencesChanged} occurrences of text`);
      return { occurrencesChanged };
    } catch (error) {
      console.error('Error replacing text:', error);
      throw error;
    }
  },

  exportDocumentAsText: async (
    config: ConnectionConfig, 
    documentId: string
  ): Promise<string> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Exporting document as text: ${documentId}`);
      
      // First, get the document content
      const document = await makeDocsApiRequest(
        `/documents/${documentId}`,
        config.credentials.accessToken
      );

      // Extract text content from the document structure
      let text = '';
      if (document.body && document.body.content) {
        document.body.content.forEach((element: any) => {
          if (element.paragraph) {
            element.paragraph.elements.forEach((paragraphElement: any) => {
              if (paragraphElement.textRun) {
                text += paragraphElement.textRun.content;
              }
            });
          }
        });
      }

      console.log(`Successfully exported document text (${text.length} characters)`);
      return text;
    } catch (error) {
      console.error('Error exporting document as text:', error);
      throw error;
    }
  }
};
