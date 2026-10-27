/**
 * Typed HTTP client for communicating with the FastAPI Personal AI Assistant backend.
 */

import {
  HealthStatus,
  ConversationItem,
  MessageItem,
  ModelOption,
  MemoryItem,
  DocumentItem,
  TaskItem,
  NoteItem,
  EmailThreadItem,
  EmailMessageItem,
  CalendarEventItem,
  PendingActionItem,
  ResearchReportItem,
  SearchResultItem,
  GoogleAuthUrlResponse,
  GoogleConnectionStatus,
  GmailSyncResult,
  UserProfileItem,
  AuthTokenResponse,
} from "./api-types";
import { ApiIntegrations } from "./api-integrations";
import { ApiAuth } from "./api-auth";

export * from "./api-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiClient {
  private baseUrl: string;
  private integrations: ApiIntegrations;
  private auth: ApiAuth;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.auth = new ApiAuth(this.request.bind(this));
    this.integrations = new ApiIntegrations(this.request.bind(this));
  }

  getAuthToken(): string | null {
    return this.auth.getAuthToken();
  }

  setAuthToken(token: string | null): void {
    this.auth.setAuthToken(token);
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeaders(),
      ...(options.headers || {}),
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorMessage = `API Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          if (typeof errorJson.detail === "string") {
            errorMessage = errorJson.detail;
          } else if (Array.isArray(errorJson.detail)) {
            errorMessage = errorJson.detail
              .map((e: any) => e.msg || e.message || JSON.stringify(e))
              .join("; ");
          } else {
            errorMessage = JSON.stringify(errorJson.detail);
          }
        }
      } catch {
        // fallback
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return {} as T;
    }

    const text = await response.text();
    if (!text || !text.trim()) {
      return {} as T;
    }
    return JSON.parse(text) as T;
  }

  async checkHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>("/api/v1/health");
  }

  // --- Auth & User Profile Delegated Methods ---

  register = (email: string, password: string, fullName?: string) =>
    this.auth.register(email, password, fullName);
  login = (email: string, password: string) => this.auth.login(email, password);
  loginWithGoogle = (accessToken: string) => this.auth.loginWithGoogle(accessToken);
  getCurrentUser = () => this.auth.getCurrentUser();
  logout = () => this.auth.logout();

  // --- Chat & Conversation Methods ---

  async getConversations(): Promise<ConversationItem[]> {
    return this.request<ConversationItem[]>("/api/v1/conversations");
  }

  async createConversation(data?: {
    title?: string;
    model_provider?: string;
    model_name?: string;
  }): Promise<ConversationItem> {
    return this.request<ConversationItem>("/api/v1/conversations", {
      method: "POST",
      body: JSON.stringify(data || {}),
    });
  }

  async getMessages(conversationId: string): Promise<MessageItem[]> {
    return this.request<MessageItem[]>(
      `/api/v1/conversations/${conversationId}/messages`
    );
  }

  async sendMessage(
    conversationId: string,
    message: string,
    modelProvider?: string,
    modelName?: string
  ): Promise<MessageItem> {
    return this.request<MessageItem>(
      `/api/v1/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: message,
          message,
          model_provider: modelProvider,
          model_name: modelName,
        }),
      }
    );
  }

  async getModels(): Promise<ModelOption[]> {
    return this.request<ModelOption[]>("/api/v1/models");
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.request(`/api/v1/conversations/${conversationId}`, {
      method: "DELETE",
    });
  }

  async updateConversationModel(
    conversationId: string,
    modelProvider: string,
    modelName: string
  ): Promise<ConversationItem> {
    return this.request<ConversationItem>(
      `/api/v1/conversations/${conversationId}/model`,
      {
        method: "PATCH",
        body: JSON.stringify({
          model_provider: modelProvider,
          model_name: modelName,
        }),
      }
    );
  }

  // --- Memory Methods ---

  async getMemories(category?: string, query?: string): Promise<MemoryItem[]> {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (query) params.append("query", query);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return this.request<MemoryItem[]>(`/api/v1/memories${queryString}`);
  }

  async createMemory(
    contentOrData: string | { category: string; content: string; confidence?: number },
    category?: string
  ): Promise<MemoryItem> {
    const payload =
      typeof contentOrData === "string"
        ? { content: contentOrData, category: category || "general" }
        : contentOrData;
    return this.request<MemoryItem>("/api/v1/memories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async searchMemories(query: string, limit = 5): Promise<any[]> {
    return this.request<any[]>(
      `/api/v1/memories/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  async deleteMemory(memoryId: string): Promise<void> {
    await this.request(`/api/v1/memories/${memoryId}`, {
      method: "DELETE",
    });
  }

  // --- Document Methods ---

  async getDocuments(): Promise<DocumentItem[]> {
    return this.request<DocumentItem[]>("/api/v1/documents");
  }

  async uploadDocument(file: File): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append("file", file);

    const headers = this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/api/v1/documents/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Upload failed (${response.status})`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) errorMessage = errorJson.detail;
      } catch {
        // ignore
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.request(`/api/v1/documents/${documentId}`, {
      method: "DELETE",
    });
  }

  async searchDocuments(query: string, limit = 4): Promise<any[]> {
    return this.request<any[]>(
      `/api/v1/documents/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  // --- Task Methods ---

  async getTasks(status?: string, priority?: string): Promise<TaskItem[]> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (priority) params.append("priority", priority);
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<TaskItem[]>(`/api/v1/tasks${query}`);
  }

  async createTask(data: {
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
  }): Promise<TaskItem> {
    return this.request<TaskItem>("/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTaskStatus(taskId: string, status: string): Promise<TaskItem> {
    return this.request<TaskItem>(`/api/v1/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      due_date?: string | null;
    }
  ): Promise<TaskItem> {
    return this.request<TaskItem>(`/api/v1/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.request(`/api/v1/tasks/${taskId}`, {
      method: "DELETE",
    });
  }

  // --- Notes Methods ---

  async getNotes(tag?: string): Promise<NoteItem[]> {
    const params = new URLSearchParams();
    if (tag) params.append("tag", tag);
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<NoteItem[]>(`/api/v1/notes${query}`);
  }

  async createNote(data: {
    title: string;
    content: string;
    tags?: string[];
  }): Promise<NoteItem> {
    return this.request<NoteItem>("/api/v1/notes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteNote(noteId: string): Promise<void> {
    await this.request(`/api/v1/notes/${noteId}`, {
      method: "DELETE",
    });
  }

  // --- Email Methods ---

  async getEmailThreads(unreadOnly = false, query?: string): Promise<EmailThreadItem[]> {
    const params = new URLSearchParams();
    if (unreadOnly) params.append("unread_only", "true");
    if (query) params.append("q", query);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return this.request<EmailThreadItem[]>(`/api/v1/emails/threads${qs}`);
  }

  async getThreadMessages(threadId: string): Promise<EmailMessageItem[]> {
    return this.request<EmailMessageItem[]>(`/api/v1/emails/threads/${threadId}`);
  }

  async getEmailThreadMessages(threadId: string): Promise<EmailMessageItem[]> {
    return this.getThreadMessages(threadId);
  }

  async markThreadRead(threadId: string): Promise<void> {
    await this.request(`/api/v1/emails/threads/${threadId}/read`, {
      method: "POST",
    });
  }

  async createEmailDraft(data: {
    recipient: string;
    subject: string;
    body: string;
    thread_id?: string;
  }): Promise<EmailMessageItem> {
    return this.request<EmailMessageItem>("/api/v1/emails/drafts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // --- Calendar Methods ---

  async getCalendarEvents(startDate?: string, endDate?: string): Promise<CalendarEventItem[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<CalendarEventItem[]>(`/api/v1/calendar/events${query}`);
  }

  async createCalendarEvent(data: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    attendees?: string[];
  }): Promise<CalendarEventItem> {
    return this.request<CalendarEventItem>("/api/v1/calendar/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // --- Approvals Methods ---

  async getPendingActions(status = "pending"): Promise<PendingActionItem[]> {
    return this.request<PendingActionItem[]>(`/api/v1/approvals?status=${status}`);
  }

  async decideAction(
    actionId: string,
    approved: boolean,
    rejectionReason?: string
  ): Promise<PendingActionItem> {
    return this.request<PendingActionItem>(`/api/v1/approvals/${actionId}/decision`, {
      method: "POST",
      body: JSON.stringify({ approved, rejection_reason: rejectionReason }),
    });
  }

  // --- Research & Reporting Methods ---

  async getResearchReports(topic?: string): Promise<ResearchReportItem[]> {
    const q = topic ? `?topic=${encodeURIComponent(topic)}` : "";
    return this.request<ResearchReportItem[]>(`/api/v1/research${q}`);
  }

  async generateResearchReport(topic: string, numSources = 3): Promise<ResearchReportItem> {
    return this.request<ResearchReportItem>("/api/v1/research/generate", {
      method: "POST",
      body: JSON.stringify({ topic, num_sources: numSources }),
    });
  }

  async deleteResearchReport(reportId: string): Promise<void> {
    await this.request(`/api/v1/research/${reportId}`, {
      method: "DELETE",
    });
  }

  async quickSearch(query: string, limit = 5): Promise<SearchResultItem[]> {
    return this.request<SearchResultItem[]>(
      `/api/v1/research/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  // --- Delegated Google & Gmail Integrations ---

  getGoogleAuthUrl = () => this.integrations.getGoogleAuthUrl();
  getGoogleStatus = () => this.integrations.getGoogleStatus();
  disconnectGoogle = () => this.integrations.disconnectGoogle();
  syncGmail = (maxResults = 10) => this.integrations.syncGmail(maxResults);
  searchGmail = (query: string, limit = 10) => this.integrations.searchGmail(query, limit);
  sendLiveGmail = (data: { recipient: string; subject: string; body: string; thread_id?: string }) =>
    this.integrations.sendLiveGmail(data);
  sendEmail = (data: { recipient: string; subject: string; body: string; thread_id?: string }) =>
    this.integrations.sendEmail(data);
  starGmailMessage = (messageId: string, starred = true) =>
    this.integrations.starGmailMessage(messageId, starred);
  readGmailMessage = (messageId: string, read = true) =>
    this.integrations.readGmailMessage(messageId, read);
  trashGmailMessage = (messageId: string) => this.integrations.trashGmailMessage(messageId);
}

export const api = new ApiClient(API_BASE_URL);
