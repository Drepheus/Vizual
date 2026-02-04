"use client";

/**
 * Dynamic CSS Loader
 *
 * Lazily loads CSS files when components are mounted,
 * reducing initial page load time.
 */

const loadedStyles = new Set<string>();

/**
 * Dynamically load a CSS file
 * Returns a promise that resolves when the stylesheet is loaded
 */
export function loadCSS(href: string): Promise<void> {
  // Skip if already loaded
  if (loadedStyles.has(href)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    // Check if link already exists in DOM
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) {
      loadedStyles.add(href);
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => {
      loadedStyles.add(href);
      resolve();
    };
    link.onerror = () => {
      reject(new Error(`Failed to load CSS: ${href}`));
    };

    document.head.appendChild(link);
  });
}

/**
 * Preload a CSS file (downloads but doesn't apply)
 * Good for styles that will be needed soon
 */
export function preloadCSS(href: string): void {
  if (loadedStyles.has(href)) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * CSS module mapping for lazy loading
 */
export const cssModules = {
  // Admin pages
  adminDashboard: '/css/AdminDashboard.css',

  // Studio pages
  mediaStudio: '/css/MediaStudio.css',
  googleAIStudio: '/css/GoogleAIStudio.css',
  replicateStudio: '/css/ReplicateStudio.css',

  // Feature components
  webSearch: '/css/WebSearch.css',
  webTaskModal: '/css/WebTaskModal.css',
  commandHub: '/css/CommandHub.css',
  mediaGallery: '/css/MediaGallery.css',
  searchModal: '/css/SearchModal.css',
  settingsModal: '/css/SettingsModal.css',
  paywallModal: '/css/PaywallModal.css',

  // Visual effects
  chromaGrid: '/css/ChromaGrid.css',
  domeGallery: '/css/DomeGallery.css',
  metallicPaint: '/css/MetallicPaint.css',

  // Workflows
  aiWorkflowsPage: '/css/AIWorkflowsPage.css',
} as const;

/**
 * React hook for loading CSS on mount
 */
export function useLoadCSS(cssPath: string | string[]) {
  if (typeof window === 'undefined') return;

  const paths = Array.isArray(cssPath) ? cssPath : [cssPath];

  // Load immediately on client
  paths.forEach(path => {
    loadCSS(path).catch(console.error);
  });
}

export default loadCSS;
