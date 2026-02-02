import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Create a simple client for public reads (RLS policy allows anon to read public media)
function getSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    // Try service role key first for admin access, fallback to anon key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const apiKey = serviceRoleKey || anonKey;
    
    return createClient(url, apiKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    });
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '0');
        const limit = parseInt(searchParams.get('limit') || '12'); // Low limit to prevent crashes

        const supabase = getSupabaseClient();

        const start = page * limit;
        const end = start + limit - 1;

        // 1. Fetch Media (try with is_public filter, fallback to all)
        let mediaItems: any[] = [];
        let mediaError: any = null;

        // First try with is_public filter
        const result = await supabase
            .from('generated_media')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .range(start, end);

        if (result.error && result.error.message?.includes('is_public')) {
            // Column doesn't exist yet, fetch all media
            console.log('is_public column not found, fetching all media');
            const fallbackResult = await supabase
                .from('generated_media')
                .select('*')
                .order('created_at', { ascending: false })
                .range(start, end);
            
            mediaItems = fallbackResult.data || [];
            mediaError = fallbackResult.error;
        } else {
            mediaItems = result.data || [];
            mediaError = result.error;
        }

        if (mediaError) throw mediaError;

        if (!mediaItems || mediaItems.length === 0) {
            return NextResponse.json([]);
        }

        // 2. Fetch Authors (Manual Join)
        const userIds = Array.from(new Set(mediaItems.map(item => item.user_id)));

        // Try to fetch from 'profiles' table first (standard Supabase), then 'users'
        let userMap: Record<string, any> = {};

        try {
            // Try profiles table first
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, email')
                .in('id', userIds);

            if (!profilesError && profiles && profiles.length > 0) {
                profiles.forEach(u => {
                    userMap[u.id] = { 
                        name: u.full_name || u.email?.split('@')[0] || 'Vizual Artist',
                        avatar_url: u.avatar_url 
                    };
                });
            } else {
                // Fallback to users table
                const { data: users, error: usersError } = await supabase
                    .from('users')
                    .select('id, name, avatar_url')
                    .in('id', userIds);

                if (!usersError && users) {
                    users.forEach(u => {
                        userMap[u.id] = u;
                    });
                }
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
