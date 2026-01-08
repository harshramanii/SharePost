import { supabase } from '../config/supabase';

export const contactSupportService = {
  // Submit a contact support request
  submitContactSupport: async supportData => {
    try {
      const { data, error } = await supabase
        .from('contact_support')
        .insert({
          title: supportData.title,
          description: supportData.description,
          email: supportData.email,
          priority: supportData.priority || 'medium',
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error submitting contact support:', error);
      return { data: null, error };
    }
  },

  // Get user's contact support requests (optional - for viewing history)
  getUserContactSupportRequests: async email => {
    try {
      const { data, error } = await supabase
        .from('contact_support')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching contact support requests:', error);
      return { data: null, error };
    }
  },
};

