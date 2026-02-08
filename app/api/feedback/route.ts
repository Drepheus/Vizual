import { NextRequest, NextResponse } from 'next/server';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1469869372435857613/SDnq814CswBn7f9tK5fe750F8dVfQBtYg6L-Eky2e7eyCyQ43xL3OaS9qauuj5BqEczB';

export async function POST(request: NextRequest) {
  try {
    const { feedback, userEmail, plan } = await request.json();

    if (!feedback || typeof feedback !== 'string' || !feedback.trim()) {
      return NextResponse.json({ error: 'Feedback is required' }, { status: 400 });
    }

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '📝 New Feedback',
          description: feedback.trim(),
          color: 0x5865F2,
          fields: [
            { name: 'User', value: userEmail || 'Guest', inline: true },
            { name: 'Plan', value: plan || 'free', inline: true },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, await response.text());
      return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
