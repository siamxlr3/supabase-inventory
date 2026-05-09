import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useDispatch } from 'react-redux';
import { baseApi } from '@/store/api/baseApi';

/**
 * Custom hook to listen for real-time changes in Supabase tables
 * and automatically invalidate Redux Toolkit Query tags.
 * 
 * @param table The table name to listen to
 * @param tags The RTK Query tags to invalidate on changes
 */
export const useRealtime = (table: string, tags: string[]) => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(`[Realtime] Subscribing to ${table}...`);
    const channel = supabase
      .channel(`realtime-api-${table}-${Math.random().toString(36).substring(7)}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload) => {
          console.log(`[Realtime] Received ${payload.eventType} on ${table}:`, payload);
          dispatch(baseApi.util.invalidateTags(tags as any));
          // Manual refetch trigger (if needed)
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Subscription status for ${table}:`, status);
      });

    return () => {
      console.log(`[Realtime] Unsubscribing from ${table}`);
      supabase.removeChannel(channel);
    };
  }, [table, tags, dispatch]);
};
