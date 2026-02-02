import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '0');
        const limit = parseInt(searchParams.get('limit') || '12'); // Low limit to prevent crashes

        // Service Role / Admin Client to bypass RLS
        const supabase = getServerSupabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY);

        const start = page * limit;
        const end = start + limit - 1;

        // 1. Fetch Media
        const { data: mediaItems, error: mediaError } = await supabase
            .from('generated_media')
            .select('*')
            .order('created_at', { ascending: false })
            .range(start, end);

        if (mediaError) throw mediaError;

        if (!mediaItems || mediaItems.length === 0) {
            return NextResponse.json([]);
        }

        // 2. Fetch Authors (Manual Join)
        const userIds = Array.from(new Set(mediaItems.map(item => item.user_id)));

        // We try to fetch from 'users' table (public profile) if it exists
        // If this fails (table missing), we continue with default names
        let userMap: Record<string, any> = {};

        try {
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, name, avatar_url')
                .in('id', userIds);

            if (!usersError && users) {
                users.forEach(u => {
                    userMap[u.id] = u;
                });
            }
        } catch (e) {
            console.warn('Could not fetch user profiles:', e);
        }

        // 3. Transform Data for Frontend
        const enrichedMedia = mediaItems.map(item => ({
            id: item.id,
            type: item.type,
            src: item.url,
            prompt: item.prompt,
            // Map author info
            author: userMap[item.user_id]?.name || 'Vizual Artist',
            authorAvatar: userMap[item.user_id]?.avatar_url || null,
            // Mock likes/stats since we don't have them yet
            likes: Math.floor(Math.random() * 500) + 10,
            created_at: item.created_at
        }));

        return NextResponse.json(enrichedMedia);

    } catch (err: any) {
        console.error('Community feed error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
