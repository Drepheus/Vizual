import * as Sentry from '@sentry/node';

// Initialize Sentry for backend error tracking
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.VERCEL_ENV || 'development',
  });
}

export { Sentry };
