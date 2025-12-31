// Skyvern AI Web Task Type Definitions
// For use with Skyvern Cloud API (https://api.skyvern.com)

/**
 * Skyvern AI Engine Types
 * - skyvern-1.0: Simple tasks (form filling, searches)
 * - skyvern-2.0: Complex multi-step tasks (RECOMMENDED)
 * - openai-cua: OpenAI's Computer Use Agent
 * - anthropic-cua: Anthropic's Claude with computer use
 * - ui-tars: UI-TARS model
 */
export type SkyvernEngine = 
  | 'skyvern-1.0' 
  | 'skyvern-2.0' 
  | 'openai-cua' 
  | 'anthropic-cua' 
  | 'ui-tars';

/**
 * Task Status Lifecycle
 */
export type TaskStatus = 
  | 'created'     // Task created, not yet queued
  | 'queued'      // Task queued for execution
  | 'running'     // Task currently executing
  | 'completed'   // Task completed successfully
  | 'failed'      // Task failed with error
  | 'terminated'; // Task manually terminated

/**
 * Proxy Location Options (Skyvern Cloud only)
 * Geographic targeting for browser traffic
 */
export type ProxyLocation = 
  | 'RESIDENTIAL'        // Default: Random US residential
  | 'RESIDENTIAL_ES'     // Spain
  | 'RESIDENTIAL_IE'     // Ireland
  | 'RESIDENTIAL_GB'     // United Kingdom
  | 'RESIDENTIAL_IN'     // India
  | 'RESIDENTIAL_JP'     // Japan
  | 'RESIDENTIAL_FR'     // France
  | 'RESIDENTIAL_DE'     // Germany
  | 'RESIDENTIAL_NZ'     // New Zealand
  | 'RESIDENTIAL_ZA'     // South Africa
  | 'RESIDENTIAL_AR'     // Argentina
  | 'RESIDENTIAL_AU'     // Australia
  | 'RESIDENTIAL_ISP'    // ISP proxy
  | 'US-CA'              // California
  | 'US-NY'              // New York
  | 'US-TX'              // Texas
  | 'US-FL'              // Florida
  | 'US-WA'              // Washington
  | 'NONE';              // No proxy

/**
 * Request to Skyvern API for creating a task
 */
export interface SkyvernTaskRequest {
  /** Task description/goal for AI to accomplish */
  prompt: string;
  
  /** Optional starting URL (AI will determine if not provided) */
  url?: string;
  
  /** AI engine to use (default: skyvern-2.0) */
  engine?: SkyvernEngine;
  
  /** Optional task title for identification */
  title?: string;
  
  /** Geographic proxy location (Skyvern Cloud only) */
  proxy_location?: ProxyLocation;
  
  /** JSON schema for data extraction */
  data_extraction_schema?: Record<string, any>;
  
  /** Custom error code mappings */
  error_code_mapping?: Record<string, string>;
  
  /** Maximum steps allowed (default: 15, affects billing) */
  max_steps?: number;
  
  /** Webhook URL for completion notification */
  webhook_url?: string;
  
  /** TOTP/2FA identifier */
  totp_identifier?: string;
  
  /** TOTP/2FA endpoint URL */
  totp_url?: string;
  
  /** Browser session ID for persistent state */
  browser_session_id?: string;
  
  /** Model configuration overrides */
  model?: Record<string, any>;
  
  /** Extra HTTP headers for browser requests */
  extra_http_headers?: Record<string, string>;
  
  /** Publish as reusable workflow (skyvern-2.0 only) */
  publish_workflow?: boolean;
  
  /** Include action history in verification (default: false) */
  include_action_history_in_verification?: boolean;
  
  /** Max screenshot scrolls (0 = viewport only) */
  max_screenshot_scrolls?: number;
  
  /** CDP address for custom browser */
  browser_address?: string;
}

/**
 * Downloaded file metadata
 */
export interface DownloadedFile {
  /** Direct URL to file */
  url: string;
  
  /** Original filename */
  filename: string;
  
  /** File checksum for verification */
  checksum: string;
  
  /** File modification timestamp */
  modified_at?: string;
}

/**
 * Response from Skyvern API after task creation/status check
 */
export interface SkyvernTaskResponse {
  /** Unique run ID (starts with 'tsk_' or 'wr_') */
  run_id: string;
  
  /** Current task status */
  status: TaskStatus;
  
  /** Task creation timestamp */
  created_at: string;
  
  /** Last modification timestamp */
  modified_at: string;
  
  /** Run type identifier */
  run_type: 'task_v1' | 'task_v2' | 'openai_cua' | 'anthropic_cua' | 'ui_tars';
  
  /** Extracted output data (if any) */
  output?: Record<string, any> | string | null;
  
  /** List of downloaded files */
  downloaded_files?: DownloadedFile[] | null;
  
  /** Recording URL for playback */
  recording_url?: string | null;
  
  /** Screenshot URLs (newest first) */
  screenshot_urls?: string[] | null;
  
  /** Failure reason if status is 'failed' */
  failure_reason?: string | null;
  
  /** Timestamp when queued */
  queued_at?: string | null;
  
  /** Timestamp when execution started */
  started_at?: string | null;
  
  /** Timestamp when execution finished */
  finished_at?: string | null;
  
  /** Skyvern app URL to view task */
  app_url?: string | null;
  
  /** Browser session ID used */
  browser_session_id?: string | null;
  
  /** Max screenshot scrolls setting */
  max_screenshot_scrolls?: number | null;
  
  /** Script run result */
  script_run?: {
    ai_fallback_triggered: boolean;
  } | null;
  
  /** Error details */
  errors?: Array<Record<string, any>> | null;
  
  /** Original request parameters */
  run_request?: SkyvernTaskRequest | null;
}

/**
 * Vizual AI internal response structure
 * Includes usage tracking and educational context
 */
export interface WebTaskResult {
  /** Success flag */
  success: boolean;
  
  /** Skyvern task/run ID */
  task_id: string;
  
  /** Current status */
  status: TaskStatus;
  
  /** Task output */
  output?: Record<string, any> | string;
  
  /** Screenshot URLs */
  screenshot_urls?: string[];
  
  /** Recording URL */
  recording_url?: string;
  
  /** Skyvern app URL */
  app_url?: string;
  
  /** Downloaded files */
  downloaded_files?: Array<{
    url: string;
    filename: string;
  }>;
  
  /** Failure reason */
  failure_reason?: string;
  
  /** Educational tip for users */
  educational_tip?: string;
  
  /** Usage tracking info */
  usage?: {
    current: number;
    limit: number;
    remaining: number;
  };
}

/**
 * Error response structure
 */
export interface WebTaskError {
  /** Error type */
  error: string;
  
  /** Detailed error message */
  details: string;
  
  /** Whether upgrade is required (for free tier) */
  upgrade_required?: boolean;
  
  /** Current subscription tier */
  tier?: 'free' | 'pro' | 'ultra';
  
  /** Current usage count */
  current?: number;
  
  /** Usage limit */
  limit?: number;
  
  /** Reset date for usage limit */
  reset_at?: string;
}

/**
 * Subscription tier limits for AI Web Task
 */
export const WEB_TASK_LIMITS = {
  free: 0,   // Not available on free tier
  pro: 10,   // 10 tasks per month
  ultra: 50, // 50 tasks per month
} as const;

/**
 * Polling configuration for task completion
 */
export const POLLING_CONFIG = {
  /** Maximum polling attempts */
  maxAttempts: 30,
  
  /** Interval between polls (ms) */
  intervalMs: 2000,
  
  /** Total max wait time (ms) */
  maxWaitMs: 60000,
} as const;

/**
 * Type guard to check if response is an error
 */
export function isWebTaskError(response: WebTaskResult | WebTaskError): response is WebTaskError {
  return 'error' in response && typeof response.error === 'string';
}

/**
 * Type guard to check if task is terminal (completed, failed, or terminated)
 */
export function isTerminalStatus(status: TaskStatus): boolean {
  return ['completed', 'failed', 'terminated'].includes(status);
}
