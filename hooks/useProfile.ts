import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, ProfileUpdate } from '../lib/database.types';
import { useAuth } from './useAuth';
import { daysBetween } from '../lib/constants';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateStreak = useCallback(async (decision: 'skipped' | 'bought') => {
    if (!profile || !user) return;

    const today = new Date().toISOString().split('T')[0];
    const lastDecision = profile.last_decision_date;

    let newStreak = profile.current_streak;

    if (!lastDecision) {
      newStreak = 1;
    } else {
      const daysSince = daysBetween(lastDecision, today);

      if (daysSince <= 1) {
        newStreak = profile.current_streak + 1;
      } else if (daysSince <= 3) {
        // Grace period
        newStreak = profile.current_streak;
      } else {
        newStreak = 1;
      }
    }

    const updates: ProfileUpdate = {
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, profile.longest_streak),
      last_decision_date: today,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setProfile({ ...profile, ...updates });
    }
  }, [profile, user]);

  const addSavedAmount = useCallback(async (amount: number) => {
    if (!profile || !user) return;

    const updates: ProfileUpdate = {
      total_saved: profile.total_saved + amount,
      items_skipped: profile.items_skipped + 1,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setProfile({ ...profile, ...updates });
    }
  }, [profile, user]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateStreak,
    addSavedAmount,
  };
}
