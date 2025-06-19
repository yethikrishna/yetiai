import { ConnectionConfig } from "@/types/platform";
import { googleOAuthHandler } from "./googleOAuthHandler";

// Types for Google Sheets operations
export interface SheetRange {
  sheetId: string;
  range: string;
}

export interface SheetCell {
  value: string | number | boolean | null;
  formattedValue?: string;
  formula?: string;
}

export interface SheetValues {
  range: string;
  values: SheetCell[][];
}

export interface Spreadsheet {
  spreadsheetId: string;
  properties: {
    title: string;
    locale?: string;
    timeZone?: string;
  };
  sheets: Sheet[];
}

export interface Sheet {
  properties: {
    sheetId: number;
    title: string;
    index: number;
    sheetType?: string;
    gridProperties?: {
      rowCount: number;
      columnCount: number;
    };
  };
  data?: {
    rowData?: {
      values?: SheetCell[]
    }[];
  };
}

// Helper function to make authenticated requests to Google Sheets API
async function makeSheetsApiRequest(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<any> {
  return googleOAuthHandler.makeAuthenticatedRequest(
    `https://sheets.googleapis.com/v4${endpoint}`,
    accessToken,
    options
  );
}

export const googleSheetsHandler = {
  connect: async (_credentials: Record<string, string>): Promise<boolean> => {
    // Configure the OAuth handler for Sheets
    googleOAuthHandler.configure('sheets', process.env.VITE_GOOGLE_CLIENT_ID || '');
    googleOAuthHandler.initiateOAuthFlow();
    return new Promise(() => {}); // Resolved after the OAuth2 callback
  },

  test: async (config: ConnectionConfig): Promise<boolean> => {
    console.log("Testing Google Sheets connection...");
    try {
      if (!config.credentials.accessToken) {
        return false;
      }

      // Test by fetching spreadsheets list
      await makeSheetsApiRequest('/spreadsheets?fields=spreadsheets.properties', 
        config.credentials.accessToken);
      console.log("Google Sheets connection test successful");
      return true;
    } catch (error) {
      console.error("Google Sheets connection test failed:", error);
      return false;
    }
  },

  disconnect: async (config: ConnectionConfig): Promise<boolean> => {
    console.log("Disconnecting from Google Sheets...");
    googleOAuthHandler.clearStoredTokens();
    return true;
  },

  // MCP Functions for Google Sheets
  getSpreadsheets: async (config: ConnectionConfig): Promise<{ id: string; name: string }[]> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log("Fetching Google Sheets spreadsheets list");
      
      // Using the Drive API to list spreadsheets (since Sheets API doesn't have a direct method)
      const response = await googleOAuthHandler.makeAuthenticatedRequest(
        'https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application/vnd.google-apps.spreadsheet%27&fields=files(id,name)',
        config.credentials.accessToken
      );

      console.log(`Found ${response.files.length} spreadsheets`);
      return response.files.map((file: any) => ({
        id: file.id,
        name: file.name
      }));
    } catch (error) {
      console.error('Error fetching spreadsheets:', error);
      throw error;
    }
  },

  getSpreadsheetData: async (
    config: ConnectionConfig, 
    spreadsheetId: string
  ): Promise<Spreadsheet> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Fetching data for spreadsheet: ${spreadsheetId}`);
      
      const response = await makeSheetsApiRequest(
        `/spreadsheets/${spreadsheetId}?includeGridData=false`,
        config.credentials.accessToken
      );

      console.log(`Successfully retrieved spreadsheet with ${response.sheets.length} sheets`);
      return response;
    } catch (error) {
      console.error('Error fetching spreadsheet data:', error);
      throw error;
    }
  },

  getSheetValues: async (
    config: ConnectionConfig, 
    spreadsheetId: string,
    range: string
  ): Promise<SheetValues> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Reading values from ${spreadsheetId}, range: ${range}`);
      
      const response = await makeSheetsApiRequest(
        `/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
        config.credentials.accessToken
      );

      // Convert raw values to SheetCell objects
      const values = response.values ? 
        response.values.map((row: any[]) => 
          row.map(value => ({ value }))
        ) : [];

      return {
        range: response.range,
        values
      };
    } catch (error) {
      console.error('Error reading sheet values:', error);
      throw error;
    }
  },

  updateSheetValues: async (
    config: ConnectionConfig, 
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<{ updatedRange: string; updatedRows: number; updatedColumns: number }> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Updating values in ${spreadsheetId}, range: ${range}`);
      
      const response = await makeSheetsApiRequest(
        `/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
        config.credentials.accessToken,
        {
          method: 'PUT',
          body: JSON.stringify({ values })
        }
      );

      console.log(`Successfully updated ${response.updatedCells} cells`);
      return {
        updatedRange: response.updatedRange,
        updatedRows: response.updatedRows,
        updatedColumns: response.updatedColumns
      };
    } catch (error) {
      console.error('Error updating sheet values:', error);
      throw error;
    }
  },

  appendSheetValues: async (
    config: ConnectionConfig, 
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<{ updatedRange: string }> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Appending values to ${spreadsheetId}, range: ${range}`);
      
      const response = await makeSheetsApiRequest(
        `/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
        config.credentials.accessToken,
        {
          method: 'POST',
          body: JSON.stringify({ values })
        }
      );

      console.log(`Successfully appended data to ${response.updates.updatedRange}`);
      return {
        updatedRange: response.updates.updatedRange
      };
    } catch (error) {
      console.error('Error appending sheet values:', error);
      throw error;
    }
  },

  createSpreadsheet: async (
    config: ConnectionConfig, 
    title: string,
    sheets?: { title: string }[]
  ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
    try {
      if (!config.credentials.accessToken) {
        throw new Error('No access token available');
      }

      console.log(`Creating new spreadsheet: ${title}`);
      
      // Prepare sheets configuration if provided
      const sheetConfigs = sheets?.map(sheet => ({
        properties: { title: sheet.title }
      })) || [{ properties: { title: 'Sheet1' } }];
      
      const response = await makeSheetsApiRequest(
        `/spreadsheets`,
        config.credentials.accessToken,
        {
          method: 'POST',
          body: JSON.stringify({
            properties: { title },
            sheets: sheetConfigs
          })
        }
      );

      console.log(`Successfully created spreadsheet with ID: ${response.spreadsheetId}`);
      return {
        spreadsheetId: response.spreadsheetId,
        spreadsheetUrl: response.spreadsheetUrl
      };
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw error;
    }
  }
};
