import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client for API routes
// This uses the service role key for server operations
export function getServerSupabaseClient(accessToken?: string): SupabaseClient {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
        );
    }

    // Use Service Role Key if available (bypasses RLS for saving data)
    // Otherwise fall back to Anon key
    const apiKey = serviceRoleKey || anonKey;

    const options: any = {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    };

    if (accessToken) {
        options.global = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };
    }

    return createClient(url, apiKey, options);
}

// Helper to get user from authorization header
export async function getUserFromRequest(request: Request): Promise<{ userId: string; email?: string; accessToken: string } | null> {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    const supabase = getServerSupabaseClient(); // Use anon client to validate token

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return null;
    }

    return { userId: user.id, email: user.email, accessToken: token };
}

// Save generated media to database
export async function saveGeneratedMedia(
    userId: string,
    type: 'image' | 'video',
    url: string,
    prompt: string,
    model?: string,
    aspectRatio?: string,
    accessToken?: string
): Promise<{ id: string } | null> {
    const supabase = getServerSupabaseClient(accessToken);

    const { data, error } = await supabase
        .from('generated_media')
        .insert({
            user_id: userId,
            type,
            url,
            prompt,
            model,
            aspect_ratio: aspectRatio || '16:9',
            title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '')
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error saving generated media:', error);
        return null;
    }

    return data;
}

// Create a draft (for tracking in-progress generations)
export async function createDraft(
    userId: string,
    type: 'image' | 'video',
    prompt: string,
    model?: string,
    aspectRatio?: string,
    accessToken?: string
): Promise<{ id: string } | null> {
    const supabase = getServerSupabaseClient(accessToken);

    const { data, error } = await supabase
        .from('drafts')
        .insert({
            user_id: userId,
            type,
            prompt,
            model,
            aspect_ratio: aspectRatio || '16:9',
            status: 'processing'
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error creating draft:', error);
        return null;
    }

    return data;
}

// Update draft status
export async function updateDraftStatus(
    draftId: string,
    status: 'pending' | 'processing' | 'failed' | 'cancelled',
    errorMessage?: string,
    accessToken?: string
): Promise<boolean> {
    const supabase = getServerSupabaseClient(accessToken);

    const { error } = await supabase
        .from('drafts')
        .update({
            status,
            error_message: errorMessage,
            updated_at: new Date().toISOString()
        })
        .eq('id', draftId);

    if (error) {
        console.error('Error updating draft:', error);
        return false;
    }

    return true;
}

// Delete draft (when generation completes successfully)
export async function deleteDraft(draftId: string, accessToken?: string): Promise<boolean> {
    const supabase = getServerSupabaseClient(accessToken);

    const { error } = await supabase
        .from('drafts')
        .delete()
        .eq('id', draftId);

    if (error) {
        console.error('Error deleting draft:', error);
        return false;
    }

    return true;
}
