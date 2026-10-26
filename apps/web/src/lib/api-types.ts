/**
 * Type definitions for the Personal AI Assistant API client.
 */

export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface ConversationItem {
  id: string;
  owner_id: string;
  title: string;
  active_model_provider: string;
  active_model_name: string;
  created_at: string;
  updated_at: string;
}

export interface MessageItem {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_calls?: any[] | null;
  tool_results?: any[] | null;
  token_count: number;
  created_at: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  is_local: boolean;
  description?: string;
}

export interface MemoryItem {
  id: string;
  owner_id: string;
  category: string;
  content: string;
  confidence: number;
  source_conversation_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  id: string;
  owner_id: string;
  filename: string;
  content_type: string;
  file_size_bytes: number;
  chunk_count: number;
  status: string;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskItem {
  id: string;
  owner_id: string;
  title: string;
  description?: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string | null;
  completed_at?: string | null;
  source_conversation_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteItem {
  id: string;
  owner_id: string;
  title: string;
  content: string;
  tags: string[];
  source_conversation_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailThreadItem {
  thread_id: string;
  subject: string;
  last_sender: string;
  recipient: string;
  snippet: string;
  message_count: number;
  has_unread: boolean;
  last_activity: string;
}

export interface EmailMessageItem {
  id: string;
  thread_id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  snippet: string;
  is_read: boolean;
  is_draft: boolean;
  sent_at?: string | null;
  created_at: string;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  location?: string | null;
  attendees: string[];
  status: string;
  created_at: string;
}

export interface PendingActionItem {
  id: string;
  action_type: string;
  description: string;
  payload: Record<string, any>;
  status: string;
  executed_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
}

export interface ResearchReportItem {
  id: string;
  owner_id: string;
  title: string;
  topic: string;
  summary: string;
  content: string;
  sources: Array<{
    index?: number;
    title: string;
    url: string;
    snippet?: string;
  }>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
}

// Google & Integrations
export interface GoogleAuthUrlResponse {
  authorization_url: string;
}

export interface GoogleConnectionStatus {
  connected: boolean;
  email: string | null;
  scopes: string[];
  expires_at: string | null;
}

export interface GmailSyncResult {
  synced_count: number;
  message: string;
  messages: EmailMessageItem[];
}

// Authentication & Users
export interface UserProfileItem {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: UserProfileItem;
}
