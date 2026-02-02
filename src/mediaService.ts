import { supabase } from './supabaseClient';

export interface GeneratedMedia {
  id: string;
  user_id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  created_at: string;
}

// Save generated media to database
export async function saveGeneratedMedia(
  userId: string,
  type: 'image' | 'video',
  url: string,
  prompt: string
): Promise<boolean> {
  try {
    console.log('💾 Saving media to database:', { userId, type, url: url.substring(0, 50) + '...', prompt: prompt.substring(0, 30) + '...' });
    
    const { data, error } = await supabase
      .from('generated_media')
      .insert([
        {
          user_id: userId,
          type,
          url,
          prompt,
          is_public: true, // Make visible on community page
          created_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error saving media:', error);
      return false;
    }

    console.log('✅ Media saved successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Error saving media:', error);
    return false;
  }
}

// Get all generated media for a user
export async function getUserGeneratedMedia(
  userId: string
): Promise<GeneratedMedia[]> {
  try {
    const { data, error } = await supabase
      .from('generated_media')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching media:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching media:', error);
    return [];
  }
}

// Delete a generated media item
export async function deleteGeneratedMedia(mediaId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('generated_media')
      .delete()
      .eq('id', mediaId);

    if (error) {
      console.error('Error deleting media:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting media:', error);
    return false;
  }
}
