
const NETLIFY_API = "https://api.netlify.com/api/v1";

export interface NetlifySite {
  id: string;
  name: string;
  url: string;
  admin_url: string;
  ssl_url: string;
  created_at: string;
  updated_at: string;
  state: string;
  account_name: string;
  build_settings?: {
    repo_url?: string;
    repo_branch?: string;
    dir?: string;
    cmd?: string;
  };
}

export interface NetlifyDeploy {
  id: string;
  site_id: string;
  state: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  url: string;
  ssl_url: string;
  admin_url: string;
  commit_ref?: string;
  commit_url?: string;
  branch?: string;
  error_message?: string;
}

export interface NetlifyBuild {
  id: string;
  site_id: string;
  state: string;
  created_at: string;
  sha: string;
  title: string;
  error?: string;
}

export interface CreateSiteData {
  name: string;
  repo?: {
    repo: string;
    branch?: string;
    dir?: string;
    cmd?: string;
  };
}

class NetlifyService {
  private getHeaders(accessToken: string) {
    return {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    };
  }

  async testConnection(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${NETLIFY_API}/user`, {
        headers: this.getHeaders(accessToken)
      });
      return response.ok;
    } catch (error) {
      console.error('Netlify connection test failed:', error);
      return false;
    }
  }

  async getSites(accessToken: string): Promise<NetlifySite[]> {
    try {
      const response = await fetch(`${NETLIFY_API}/sites`, {
        headers: this.getHeaders(accessToken)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sites: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Netlify sites:', error);
      throw error;
    }
  }

  async getSiteDetails(accessToken: string, siteId: string): Promise<NetlifySite> {
    try {
      const response = await fetch(`${NETLIFY_API}/sites/${siteId}`, {
        headers: this.getHeaders(accessToken)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch site details: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Netlify site details:', error);
      throw error;
    }
  }

  async getDeployments(accessToken: string, siteId: string): Promise<NetlifyDeploy[]> {
    try {
      const response = await fetch(`${NETLIFY_API}/sites/${siteId}/deploys`, {
        headers: this.getHeaders(accessToken)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch deployments: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Netlify deployments:', error);
      throw error;
    }
  }

  async createSite(accessToken: string, siteData: CreateSiteData): Promise<NetlifySite> {
    try {
      const data: any = {
        name: siteData.name
      };

      if (siteData.repo) {
        data.repo = {
          repo: siteData.repo.repo,
          branch: siteData.repo.branch || "main",
          dir: siteData.repo.dir || "",
          cmd: siteData.repo.cmd || "npm run build"
        };
      }

      const response = await fetch(`${NETLIFY_API}/sites`, {
        method: 'POST',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to create site: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Netlify site:', error);
      throw error;
    }
  }

  async triggerBuild(accessToken: string, siteId: string): Promise<NetlifyBuild> {
    try {
      const response = await fetch(`${NETLIFY_API}/sites/${siteId}/builds`, {
        method: 'POST',
        headers: this.getHeaders(accessToken)
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger build: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error triggering Netlify build:', error);
      throw error;
    }
  }

  async deleteSite(accessToken: string, siteId: string): Promise<void> {
    try {
      const response = await fetch(`${NETLIFY_API}/sites/${siteId}`, {
        method: 'DELETE',
        headers: this.getHeaders(accessToken)
      });

      if (!response.ok) {
        throw new Error(`Failed to delete site: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting Netlify site:', error);
      throw error;
    }
  }

  async updateSite(accessToken: string, siteId: string, updates: Partial<CreateSiteData>): Promise<NetlifySite> {
    try {
      const response = await fetch(`${NETLIFY_API}/sites/${siteId}`, {
        method: 'PATCH',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update site: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating Netlify site:', error);
      throw error;
    }
  }
}

export const netlifyService = new NetlifyService();
