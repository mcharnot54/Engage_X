interface ADUser {
  employeeId: string;
  employeeNumber?: string;
  displayName: string;
  mail?: string;
  department?: string;
  userPrincipalName: string;
  objectId: string;
}

interface ADConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
}

export class ActiveDirectoryService {
  private config: ADConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: ADConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || "https://graph.microsoft.com/v1.0",
    };
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    });

    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + data.expires_in * 1000 - 60000; // Subtract 1 minute for safety

      return this.accessToken;
    } catch (error) {
      console.error("Error getting AD access token:", error);
      throw new Error("Failed to authenticate with Active Directory");
    }
  }

  async getUsers(filter?: string): Promise<ADUser[]> {
    const token = await this.getAccessToken();
    let url = `${this.config.baseUrl}/users`;

    const params = new URLSearchParams({
      $select:
        "id,displayName,mail,userPrincipalName,department,employeeId,employeeType",
      $top: "999",
    });

    if (filter) {
      params.append("$filter", filter);
    }

    url += `?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();

      return data.value.map((user: any) => ({
        employeeId: user.employeeId || user.id,
        employeeNumber: user.employeeType,
        displayName: user.displayName,
        mail: user.mail,
        department: user.department,
        userPrincipalName: user.userPrincipalName,
        objectId: user.id,
      }));
    } catch (error) {
      console.error("Error fetching AD users:", error);
      throw new Error("Failed to fetch users from Active Directory");
    }
  }

  async getUserByEmployeeId(employeeId: string): Promise<ADUser | null> {
    const users = await this.getUsers(`employeeId eq '${employeeId}'`);
    return users.length > 0 ? users[0] : null;
  }

  async syncUsers(): Promise<ADUser[]> {
    return await this.getUsers();
  }
}

export function createADService(): ActiveDirectoryService | null {
  const tenantId = process.env.AD_TENANT_ID;
  const clientId = process.env.AD_CLIENT_ID;
  const clientSecret = process.env.AD_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    console.warn(
      "Active Directory configuration not found. Please set AD_TENANT_ID, AD_CLIENT_ID, and AD_CLIENT_SECRET environment variables.",
    );
    return null;
  }

  return new ActiveDirectoryService({
    tenantId,
    clientId,
    clientSecret,
  });
}
