
const VERCEL_API = "https://api.vercel.com";

export interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  state: string;
  createdAt: string;
  target: string;
  projectId: string;
}

export interface VercelProject {
  id: string;
  name: string;
  framework: string;
  createdAt: string;
  updatedAt: string;
  link?: {
    type: string;
    repo: string;
  };
}

export interface CreateProjectData {
  name: string;
  repo: string;
  framework?: string;
}

class VercelService {
  private getHeaders(accessToken: string) {
    return {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    };
  }

  async testConnection(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${VERCEL_API}/v2/user`, {
        headers: this.getHeaders(accessToken)
      });
      return response.ok;
    } catch (error) {
      console.error('Vercel connection test failed:', error);
      return false;
    }
  }

  async getDeployments(accessToken: string, projectName?: string): Promise<VercelDeployment[]> {
    try {
      const url = projectName 
        ? `${VERCEL_API}/v6/deployments?projectId=${projectName}`
        : `${VERCEL_API}/v6/deployments`;
      
      const response = await fetch(url, {
        headers: this.getHeaders(accessToken)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch deployments: ${response.statusText}`);
      }

      const data = await response.json();
      return data.deployments || [];
    } catch (error) {
      console.error('Error fetching Vercel deployments:', error);
      throw error;
    }
  }

  async getProjects(accessToken: string): Promise<VercelProject[]> {
    try {
      const response = await fetch(`${VERCEL_API}/v9/projects`, {
        headers: this.getHeaders(accessToken)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data = await response.json();
      return data.projects || [];
    } catch (error) {
      console.error('Error fetching Vercel projects:', error);
      throw error;
    }
  }

  async getProjectDetails(accessToken: string, projectId: string): Promise<VercelProject> {
    try {
      const response = await fetch(`${VERCEL_API}/v9/projects/${projectId}`, {
        headers: this.getHeaders(accessToken)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project details: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Vercel project details:', error);
      throw error;
    }
  }

  async createProject(accessToken: string, projectData: CreateProjectData): Promise<VercelProject> {
    try {
      const data = {
        name: projectData.name,
        gitRepository: {
          type: "github",
          repo: projectData.repo
        },
        framework: projectData.framework || "nextjs"
      };

      const response = await fetch(`${VERCEL_API}/v9/projects`, {
        method: 'POST',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Vercel project:', error);
      throw error;
    }
  }

  async triggerRedeploy(accessToken: string, deploymentId: string): Promise<any> {
    try {
      const response = await fetch(`${VERCEL_API}/v13/deployments/${deploymentId}/redeploy`, {
        method: 'POST',
        headers: this.getHeaders(accessToken)
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger redeploy: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error triggering Vercel redeploy:', error);
      throw error;
    }
  }

  async getDeploymentLogs(accessToken: string, deploymentId: string): Promise<string[]> {
    try {
      const response = await fetch(`${VERCEL_API}/v2/deployments/${deploymentId}/events`, {
        headers: this.getHeaders(accessToken)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch deployment logs: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((event: any) => event.text || '').filter(Boolean);
    } catch (error) {
      console.error('Error fetching Vercel deployment logs:', error);
      throw error;
    }
  }
}

export const vercelService = new VercelService();
