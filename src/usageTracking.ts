// Usage tracking helper functions

export interface UsageCheckResult {
  canPerform: boolean;
  isPro: boolean;
  currentUsage: number;
  usageLimit: number;
  resetAt: string | null;
}

export type UsageType = 'chat' | 'image_gen' | 'video_gen';

export async function checkUsageLimit(
  userId: string,
  usageType: UsageType
): Promise<UsageCheckResult> {
  try {
    const response = await fetch('/api/check-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, usageType }),
    });

    if (!response.ok) {
      throw new Error('Failed to check usage limit');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking usage limit:', error);
    throw error;
  }
}

export async function incrementUsage(
  userId: string,
  usageType: UsageType
): Promise<{ success: boolean; limitReached?: boolean }> {
  try {
    const response = await fetch('/api/increment-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, usageType }),
    });

    const data = await response.json();

    if (response.status === 403 && data.limitReached) {
      return { success: false, limitReached: true };
    }

    if (!response.ok) {
      throw new Error('Failed to increment usage');
    }

    return data;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    throw error;
  }
}

export async function createCheckoutSession(
  userId: string,
  email: string
): Promise<string> {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export function getLimitMessage(usageType: UsageType, currentUsage: number, usageLimit: number): string {
  switch (usageType) {
    case 'chat':
      return `You've used ${currentUsage} of ${usageLimit} chat prompts`;
    case 'image_gen':
      return `You've used ${currentUsage} of ${usageLimit} image generations`;
    case 'video_gen':
      return `You've used ${currentUsage} of ${usageLimit} video generations`;
  }
}
