import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getServerSupabaseClient } from '@/lib/supabase-server';

// GET - Fetch user's drafts
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
        const status = searchParams.get('status'); // 'pending', 'processing', 'failed', 'cancelled', or null for all
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const supabase = getServerSupabaseClient(authUser.accessToken);

        let query = supabase
            .from('drafts')
            .select('*')
            .eq('user_id', authUser.userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching drafts:', error);
            return NextResponse.json(
                { error: 'Failed to fetch drafts' },
                { status: 500 }
            );
        }

        // Get total count
        const { count } = await supabase
            .from('drafts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', authUser.userId);

        return NextResponse.json({
            drafts: data || [],
            count: count || 0
        });

    } catch (error: any) {
        console.error('Drafts fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch drafts' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a specific draft
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
                { error: 'Draft ID is required' },
                { status: 400 }
            );
        }

        const supabase = getServerSupabaseClient(authUser.accessToken);

        const { error } = await supabase
            .from('drafts')
            .delete()
            .eq('id', id)
            .eq('user_id', authUser.userId); // Ensure user owns this draft

        if (error) {
            console.error('Error deleting draft:', error);
            return NextResponse.json(
                { error: 'Failed to delete draft' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Draft delete error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete draft' },
            { status: 500 }
        );
    }
}

// POST - Retry a failed draft (creates a new generation request)
export async function POST(req: NextRequest) {
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
                { error: 'Draft ID is required' },
                { status: 400 }
            );
        }

        const supabase = getServerSupabaseClient(authUser.accessToken);

        // Get the draft details
        const { data: draft, error: fetchError } = await supabase
            .from('drafts')
            .select('*')
            .eq('id', id)
            .eq('user_id', authUser.userId)
            .single();

        if (fetchError || !draft) {
            return NextResponse.json(
                { error: 'Draft not found' },
                { status: 404 }
            );
        }

        // Return the draft details so frontend can retry the generation
        return NextResponse.json({
            draft: {
                type: draft.type,
                prompt: draft.prompt,
                model: draft.model,
                aspect_ratio: draft.aspect_ratio
            }
        });

    } catch (error: any) {
        console.error('Draft retry error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to retry draft' },
            { status: 500 }
        );
    }
}
