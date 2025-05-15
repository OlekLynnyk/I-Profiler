// useInitDemoProject.ts
import { useEffect } from 'react';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

export const useInitDemoProject = (
  session: any,
  supabase: SupabaseClient<any>
) => {
  useEffect(() => {
    const initialize = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('demo_attempts')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!error && !data) {
        await supabase.from('demo_attempts').insert({
          user_id: session.user.id,
          count: 0,
        });
      }
    };

    initialize();
  }, [session]);
};
