import posthog from 'posthog-js';

// PostHog configuration
const POSTHOG_KEY = 'phc_kGvq1FhHyjyyfIDIPRUj1xinb83b0iaarPExfWjFbMc';
const POSTHOG_HOST = 'https://us.i.posthog.com';

let initialized = false;

/**
 * Initialize PostHog (client-side only)
 */
export function initPostHog() {
  if (typeof window === 'undefined') return;
  if (initialized) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: {
        password: true,
      },
    },
    loaded: (ph) => {
      // Enable debug mode in development
      if (process.env.NODE_ENV === 'development') {
        ph.debug();
      }
    },
  });

  initialized = true;
}

/**
 * Identify a user (call after login)
 */
export function identifyUser(userId: string, properties?: {
  email?: string;
  name?: string;
  subscription_tier?: string;
  credits?: number;
  credits_remaining?: number;
  is_paid_user?: boolean;
  auth_provider?: string;
}) {
  if (typeof window === 'undefined') return;
  posthog.identify(userId, properties);
}

/**
 * Reset identity (call on logout)
 */
export function resetUser() {
  if (typeof window === 'undefined') return;
  posthog.reset();
}

// ============================================================
// ANALYTICS EVENTS
// Centralized event tracking for the entire app
// ============================================================

// --- Auth Events ---
export function trackSignIn(method: 'google' | 'email', email?: string) {
  posthog.capture('user_signed_in', { method, email });
}

export function trackSignUp(method: 'google' | 'email', email?: string) {
  posthog.capture('user_signed_up', { method, email });
}

export function trackSignOut() {
  posthog.capture('user_signed_out');
}

// --- Generation Events ---
export function trackGenerationStarted(props: {
  creation_mode: 'IMAGE' | 'VIDEO';
  model_id: string;
  model_name: string;
  prompt_length: number;
  has_attachments: boolean;
  active_tab?: string;
  style_tags?: string[];
  aspect_ratio?: string;
}) {
  posthog.capture('generation_started', props);
}

export function trackGenerationCompleted(props: {
  creation_mode: 'IMAGE' | 'VIDEO';
  model_id: string;
  model_name: string;
  prompt_length: number;
  duration_ms?: number;
  has_style?: boolean;
  style_names?: string[];
  aspect_ratio?: string;
}) {
  posthog.capture('generation_completed', props);
}

export function trackGenerationFailed(props: {
  creation_mode: 'IMAGE' | 'VIDEO';
  model_id: string;
  model_name: string;
  error_message: string;
}) {
  posthog.capture('generation_failed', props);
}

// --- Model Events ---
export function trackModelSelected(props: {
  model_id: string;
  model_name: string;
  is_free: boolean;
  creation_mode: 'IMAGE' | 'VIDEO';
}) {
  posthog.capture('model_selected', props);
}

// --- Credit Events ---
export function trackCreditsConsumed(props: {
  source: 'daily_free' | 'credits';
  credits_remaining: number;
  daily_free_remaining?: number;
  action: string;
}) {
  posthog.capture('credits_consumed', props);
}

export function trackCreditLimitReached(props: {
  subscription_tier: string;
  credits_remaining: number;
  daily_free_remaining: number;
}) {
  posthog.capture('credit_limit_reached', props);
}

// --- UI Interaction Events ---
export function trackCreationModeSwitch(newMode: 'IMAGE' | 'VIDEO') {
  posthog.capture('creation_mode_switched', { new_mode: newMode });
}

export function trackTabChanged(newTab: string, creationMode: string) {
  posthog.capture('tab_changed', { new_tab: newTab, creation_mode: creationMode });
}

export function trackStyleTagAdded(styleName: string) {
  posthog.capture('style_tag_added', { style_name: styleName });
}

export function trackAspectRatioChanged(newRatio: string) {
  posthog.capture('aspect_ratio_changed', { new_ratio: newRatio });
}

export function trackWelcomeModalShown() {
  posthog.capture('welcome_modal_shown');
}

export function trackWelcomeModalDismissed() {
  posthog.capture('welcome_modal_dismissed');
}

export function trackUpgradeModalOpened(attemptedModel?: string) {
  posthog.capture('upgrade_modal_opened', { attempted_model: attemptedModel });
}

// --- Landing Page Events ---
export function trackCTAClicked(source: string, isAuthenticated: boolean) {
  posthog.capture('cta_clicked', { source, is_authenticated: isAuthenticated });
}

export function trackNavLinkClicked(destination: string) {
  posthog.capture('nav_link_clicked', { destination });
}

// --- API & Error Events ---
export function trackAPIError(props: {
  endpoint: string;
  status_code: number;
  error_message: string;
  model_id?: string;
}) {
  posthog.capture('api_error', props);
}

export function trackPageView(pageName: string, properties?: Record<string, unknown>) {
  posthog.capture('$pageview', { page_name: pageName, ...properties });
}

// --- Generic event for flexibility ---
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  posthog.capture(eventName, properties);
}

export { posthog };
