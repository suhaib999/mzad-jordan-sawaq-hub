
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export type ProfileUpdateData = {
  username?: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
  location?: string; // Added location property
};

export type ProfileWithAvatar = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  address: string | null;
  location: string | null; // Added location property
};

export const fetchProfile = async (userId: string): Promise<ProfileWithAvatar | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    // Add the location property to the returned data
    return {
      ...data,
      location: data.location || null
    } as ProfileWithAvatar;
  } catch (error) {
    console.error('Error in fetchProfile:', error);
    return null;
  }
};

export const updateProfile = async (userId: string, profileData: ProfileUpdateData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return false;
  }
};

export const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return null;
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    const avatarUrl = data.publicUrl;

    // Update the profile with the new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile with avatar:', updateError);
      return null;
    }

    return avatarUrl;
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    return null;
  }
};
