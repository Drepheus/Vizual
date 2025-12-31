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
): Prvizualse<boolean> {
  try {
    const { error } = await supabase
      .from('generated_media')
      .insert([
        {
          user_id: userId,
          type,
          url,
          prompt,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error saving media:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving media:', error);
    return false;
  }
}

// Get all generated media for a user
export async function getUserGeneratedMedia(
  userId: string
): Prvizualse<GeneratedMedia[]> {
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
export async function deleteGeneratedMedia(mediaId: string): Prvizualse<boolean> {
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
