/**
 * Integrations API client module (Google OAuth, Gmail live sync & messaging).
 */

import {
  GoogleAuthUrlResponse,
  GoogleConnectionStatus,
  GmailSyncResult,
  EmailMessageItem,
} from "./api-types";

export class ApiIntegrations {
  private request: <T>(endpoint: string, options?: RequestInit) => Promise<T>;

  constructor(requestFn: <T>(endpoint: string, options?: RequestInit) => Promise<T>) {
    this.request = requestFn;
  }

  async getGoogleAuthUrl(): Promise<GoogleAuthUrlResponse> {
    return this.request<GoogleAuthUrlResponse>("/api/v1/integrations/google/auth-url");
  }

  async getGoogleStatus(): Promise<GoogleConnectionStatus> {
    return this.request<GoogleConnectionStatus>("/api/v1/integrations/google/status");
  }

  async disconnectGoogle(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      "/api/v1/integrations/google/disconnect",
      { method: "POST" }
    );
  }

  async syncGmail(maxResults = 10): Promise<GmailSyncResult> {
    return this.request<GmailSyncResult>(
      `/api/v1/integrations/google/gmail/sync?max_results=${maxResults}`,
      { method: "POST" }
    );
  }

  async searchGmail(query: string, limit = 10): Promise<any[]> {
    return this.request<any[]>(
      `/api/v1/integrations/google/gmail/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  async sendLiveGmail(data: {
    recipient: string;
    subject: string;
    body: string;
    thread_id?: string;
  }): Promise<any> {
    return this.request<any>("/api/v1/integrations/google/gmail/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async sendEmail(data: {
    recipient: string;
    subject: string;
    body: string;
    thread_id?: string;
  }): Promise<EmailMessageItem> {
    try {
      await this.sendLiveGmail(data);
    } catch {
      // Fallback to local mailbox if live Gmail isn't connected
    }
    return this.request<EmailMessageItem>("/api/v1/emails/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async starGmailMessage(messageId: string, starred = true): Promise<any> {
    return this.request<any>(
      `/api/v1/integrations/google/gmail/messages/${encodeURIComponent(messageId)}/star`,
      {
        method: "POST",
        body: JSON.stringify({ value: starred }),
      }
    );
  }

  async readGmailMessage(messageId: string, read = true): Promise<any> {
    return this.request<any>(
      `/api/v1/integrations/google/gmail/messages/${encodeURIComponent(messageId)}/read`,
      {
        method: "POST",
        body: JSON.stringify({ value: read }),
      }
    );
  }

  async trashGmailMessage(messageId: string): Promise<any> {
    return this.request<any>(
      `/api/v1/integrations/google/gmail/messages/${encodeURIComponent(messageId)}/trash`,
      { method: "POST" }
    );
  }
}
