interface SailPointUser {
  id: string;
  employeeNumber?: string;
  displayName: string;
  email?: string;
  department?: string;
  manager?: string;
  status: string;
}

interface SailPointConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

export class SailPointService {
  private config: SailPointConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: SailPointConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const tokenUrl = `${this.config.baseUrl}/oauth/token`;
    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString("base64");

    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials&scope=read",
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + data.expires_in * 1000 - 60000; // Subtract 1 minute for safety

      return this.accessToken;
    } catch (error) {
      console.error("Error getting SailPoint access token:", error);
      throw new Error("Failed to authenticate with SailPoint IdentityNow");
    }
  }

  async getIdentities(
    filters?: Record<string, string>,
  ): Promise<SailPointUser[]> {
    const token = await this.getAccessToken();
    let url = `${this.config.baseUrl}/v3/identities`;

    const params = new URLSearchParams({
      count: "true",
      limit: "250",
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        params.append("filters", `${key} eq "${value}"`);
      });
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
        throw new Error(`Failed to fetch identities: ${response.statusText}`);
      }

      const data = await response.json();

      return data.map((identity: any) => ({
        id: identity.id,
        employeeNumber: identity.attributes?.employeeNumber,
        displayName: identity.displayName || identity.name,
        email: identity.email,
        department: identity.attributes?.department,
        manager: identity.attributes?.manager,
        status: identity.lifecycleState,
      }));
    } catch (error) {
      console.error("Error fetching SailPoint identities:", error);
      throw new Error("Failed to fetch identities from SailPoint IdentityNow");
    }
  }

  async getIdentityByEmployeeNumber(
    employeeNumber: string,
  ): Promise<SailPointUser | null> {
    const identities = await this.getIdentities({ employeeNumber });
    return identities.length > 0 ? identities[0] : null;
  }

  async syncIdentities(): Promise<SailPointUser[]> {
    return await this.getIdentities();
  }
}

export function createSailPointService(): SailPointService | null {
  const baseUrl = process.env.SAILPOINT_BASE_URL;
  const clientId = process.env.SAILPOINT_CLIENT_ID;
  const clientSecret = process.env.SAILPOINT_CLIENT_SECRET;

  if (!baseUrl || !clientId || !clientSecret) {
    console.warn(
      "SailPoint configuration not found. Please set SAILPOINT_BASE_URL, SAILPOINT_CLIENT_ID, and SAILPOINT_CLIENT_SECRET environment variables.",
    );
    return null;
  }

  return new SailPointService({
    baseUrl,
    clientId,
    clientSecret,
  });
}
