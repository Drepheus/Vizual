import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getServerSupabaseClient } from '@/lib/supabase-server';

// GET - Fetch user's generated media
export async function GET(req: NextRequest) {
    try {
        const authUser = await getUserFromRequest(req);

        if (!authUser) {
            return NextResponse.json(
                { error: 'Unauthorized - please log in' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type'); // 'image', 'video', or null for all
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const supabase = getServerSupabaseClient(authUser.accessToken);

        let query = supabase
            .from('generated_media')
            .select('*')
            .eq('user_id', authUser.userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (type && (type === 'image' || type === 'video')) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching media:', error);
            return NextResponse.json(
                { error: 'Failed to fetch media' },
                { status: 500 }
            );
        }

        // Get counts for categories
        const { count: imageCount } = await supabase
            .from('generated_media')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', authUser.userId)
            .eq('type', 'image');

        const { count: videoCount } = await supabase
            .from('generated_media')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', authUser.userId)
            .eq('type', 'video');

        return NextResponse.json({
            media: data || [],
            counts: {
                images: imageCount || 0,
                videos: videoCount || 0,
                total: (imageCount || 0) + (videoCount || 0)
            }
        });

    } catch (error: any) {
        console.error('Media fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch media' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a specific media item
export async function DELETE(req: NextRequest) {
    try {
        const authUser = await getUserFromRequest(req);

        if (!authUser) {
            return NextResponse.json(
                { error: 'Unauthorized - please log in' },
                { status: 401 }
            );
        }

        const { id } = await req.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Media ID is required' },
                { status: 400 }
            );
        }

        const supabase = getServerSupabaseClient(authUser.accessToken);

        const { error } = await supabase
            .from('generated_media')
            .delete()
            .eq('id', id)
            .eq('user_id', authUser.userId); // Ensure user owns this media

        if (error) {
            console.error('Error deleting media:', error);
            return NextResponse.json(
                { error: 'Failed to delete media' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Media delete error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete media' },
            { status: 500 }
        );
    }
}

// PATCH - Update media (toggle favorite, update title)
export async function PATCH(req: NextRequest) {
    try {
        const authUser = await getUserFromRequest(req);

        if (!authUser) {
            return NextResponse.json(
                { error: 'Unauthorized - please log in' },
                { status: 401 }
            );
        }

        const { id, is_favorite, title } = await req.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Media ID is required' },
                { status: 400 }
            );
        }

        const supabase = getServerSupabaseClient(authUser.accessToken);

        const updateData: Record<string, any> = {};
        if (typeof is_favorite === 'boolean') updateData.is_favorite = is_favorite;
        if (title !== undefined) updateData.title = title;

        const { data, error } = await supabase
            .from('generated_media')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', authUser.userId) // Ensure user owns this media
            .select()
            .single();

        if (error) {
            console.error('Error updating media:', error);
            return NextResponse.json(
                { error: 'Failed to update media' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, media: data });

    } catch (error: any) {
        console.error('Media update error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update media' },
            { status: 500 }
        );
    }
}
