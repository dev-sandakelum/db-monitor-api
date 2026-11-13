/**
 * Type definitions for DB Monitor API
 */

export interface MonitorItem {
  id: string;
  title: string;
  body: string;
  type: ItemType;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  done: boolean;
  seen: boolean;
  source: string;
}

export type ItemType = 
  | "info" 
  | "warning" 
  | "error" 
  | "success" 
  | "tecmis"
  | string; // Allow custom types

export interface TecmisNotice {
  id: string; // TECMIS notice ID (e.g., "tecmis-notice-3190" or "tecmis-file-xyz.pdf")
  noticeId: string; // Original notice ID from TECMIS
  section: "recent" | "previous";
  no: string | number;
  posted_at: string; // Format: "YYYY-MM-DD/HH:MM"
  title: string;
  url: string | null;
  file: string | null;
  github_url?: string; // GitHub raw URL for attachments
}

export interface LastDateResponse {
  lastDate: string | null; // Format: "YYYY-MM-DD/HH:MM" or null
}

export interface DeleteOldRequest {
  currentIds: string[]; // Array of notice IDs to keep
}

export interface DeleteOldResponse {
  deleted: number;
  deletedIds?: string[];
  message: string;
}

export interface DeleteNoticeRequest {
  id: string; // Notice ID to delete
}

export interface DeleteNoticeResponse {
  success: boolean;
  id: string;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
}
