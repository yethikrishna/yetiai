
interface FirebaseConfig {
  projectId: string;
  apiKey: string;
  authDomain?: string;
  databaseURL?: string;
  storageBucket?: string;
}

interface FirestoreOperation {
  collection: string;
  documentId?: string;
  data?: any;
  query?: {
    field: string;
    operator: string;
    value: any;
  };
}

interface RealtimeDBOperation {
  path: string;
  data?: any;
}

interface CloudFunctionOperation {
  functionName: string;
  payload?: any;
  region?: string;
}

export class FirebaseService {
  private config: FirebaseConfig;
  private baseUrl: string;

  constructor(config: FirebaseConfig) {
    this.config = config;
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents`;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}?pageSize=1`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return false;
    }
  }

  // Firestore Operations
  async firestoreRead(operation: FirestoreOperation): Promise<any> {
    try {
      let url = `${this.baseUrl}/${operation.collection}`;
      
      if (operation.documentId) {
        url += `/${operation.documentId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Firestore read failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformFirestoreData(data);
    } catch (error) {
      console.error('Firestore read error:', error);
      throw error;
    }
  }

  async firestoreWrite(operation: FirestoreOperation): Promise<any> {
    try {
      const url = `${this.baseUrl}/${operation.collection}${operation.documentId ? `/${operation.documentId}` : ''}`;
      const method = operation.documentId ? 'PATCH' : 'POST';
      
      const firestoreData = this.transformToFirestoreFormat(operation.data);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: firestoreData
        })
      });

      if (!response.ok) {
        throw new Error(`Firestore write failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Firestore write error:', error);
      throw error;
    }
  }

  async firestoreDelete(operation: FirestoreOperation): Promise<boolean> {
    try {
      if (!operation.documentId) {
        throw new Error('Document ID is required for delete operation');
      }

      const url = `${this.baseUrl}/${operation.collection}/${operation.documentId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Firestore delete error:', error);
      throw error;
    }
  }

  // Realtime Database Operations
  async realtimeDBRead(operation: RealtimeDBOperation): Promise<any> {
    try {
      if (!this.config.databaseURL) {
        throw new Error('Database URL is required for Realtime Database operations');
      }

      const url = `${this.config.databaseURL}/${operation.path}.json?auth=${this.config.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Realtime DB read failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Realtime DB read error:', error);
      throw error;
    }
  }

  async realtimeDBWrite(operation: RealtimeDBOperation): Promise<any> {
    try {
      if (!this.config.databaseURL) {
        throw new Error('Database URL is required for Realtime Database operations');
      }

      const url = `${this.config.databaseURL}/${operation.path}.json?auth=${this.config.apiKey}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(operation.data)
      });

      if (!response.ok) {
        throw new Error(`Realtime DB write failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Realtime DB write error:', error);
      throw error;
    }
  }

  // Cloud Functions Operations
  async executeCloudFunction(operation: CloudFunctionOperation): Promise<any> {
    try {
      const region = operation.region || 'us-central1';
      const url = `https://${region}-${this.config.projectId}.cloudfunctions.net/${operation.functionName}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(operation.payload || {})
      });

      if (!response.ok) {
        throw new Error(`Cloud Function execution failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Cloud Function execution error:', error);
      throw error;
    }
  }

  // Helper methods
  private transformFirestoreData(data: any): any {
    if (data.fields) {
      const result: any = {};
      for (const [key, value] of Object.entries(data.fields)) {
        result[key] = this.extractFirestoreValue(value as any);
      }
      return result;
    }
    
    if (data.documents) {
      return data.documents.map((doc: any) => this.transformFirestoreData(doc));
    }
    
    return data;
  }

  private extractFirestoreValue(value: any): any {
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.integerValue !== undefined) return parseInt(value.integerValue);
    if (value.doubleValue !== undefined) return parseFloat(value.doubleValue);
    if (value.booleanValue !== undefined) return value.booleanValue;
    if (value.timestampValue !== undefined) return new Date(value.timestampValue);
    if (value.arrayValue) return value.arrayValue.values?.map((v: any) => this.extractFirestoreValue(v)) || [];
    if (value.mapValue) return this.transformFirestoreData({ fields: value.mapValue.fields });
    return null;
  }

  private transformToFirestoreFormat(data: any): any {
    const result: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        result[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        result[key] = Number.isInteger(value) 
          ? { integerValue: value.toString() }
          : { doubleValue: value };
      } else if (typeof value === 'boolean') {
        result[key] = { booleanValue: value };
      } else if (value instanceof Date) {
        result[key] = { timestampValue: value.toISOString() };
      } else if (Array.isArray(value)) {
        result[key] = {
          arrayValue: {
            values: value.map(v => this.transformToFirestoreFormat({ temp: v }).temp)
          }
        };
      } else if (value && typeof value === 'object') {
        result[key] = {
          mapValue: {
            fields: this.transformToFirestoreFormat(value)
          }
        };
      } else {
        result[key] = { nullValue: null };
      }
    }
    
    return result;
  }
}

export const firebaseService = {
  create: (config: FirebaseConfig) => new FirebaseService(config),
  testConnection: async (config: FirebaseConfig): Promise<boolean> => {
    const service = new FirebaseService(config);
    return await service.testConnection();
  }
};
