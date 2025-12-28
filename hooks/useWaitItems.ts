import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { WaitItem, InsertWaitItem, UpdateWaitItem } from '../lib/database.types';
import { useAuth } from './useAuth';
import { isReady } from '../lib/constants';

export type ItemStatus = 'all' | 'waiting' | 'skipped' | 'bought';

export function useWaitItems(filterStatus?: ItemStatus) {
  const { user } = useAuth();
  const [items, setItems] = useState<WaitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from('wait_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filterStatus && filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, filterStatus]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(async (item: Omit<InsertWaitItem, 'user_id'>) => {
    if (!user) return { error: { message: 'Not authenticated' } };

    const newItem: InsertWaitItem = {
      ...item,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('wait_items')
      .insert(newItem)
      .select()
      .single();

    if (!error && data) {
      setItems(prev => [data, ...prev]);
    }

    return { data, error };
  }, [user]);

  const updateItem = useCallback(async (id: string, updates: UpdateWaitItem) => {
    const { data, error } = await supabase
      .from('wait_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setItems(prev => prev.map(item => item.id === id ? data : item));
    }

    return { data, error };
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('wait_items')
      .delete()
      .eq('id', id);

    if (!error) {
      setItems(prev => prev.filter(item => item.id !== id));
    }

    return { error };
  }, []);

  const markAsSkipped = useCallback(async (id: string) => {
    return updateItem(id, {
      status: 'skipped',
      decided_at: new Date().toISOString(),
    });
  }, [updateItem]);

  const markAsBought = useCallback(async (id: string) => {
    return updateItem(id, {
      status: 'bought',
      decided_at: new Date().toISOString(),
    });
  }, [updateItem]);

  // Computed properties
  const waitingItems = items.filter(item => item.status === 'waiting' && !isReady(item.decision_due_at));
  const readyItems = items.filter(item => item.status === 'waiting' && isReady(item.decision_due_at));
  const skippedItems = items.filter(item => item.status === 'skipped');
  const boughtItems = items.filter(item => item.status === 'bought');

  return {
    items,
    waitingItems,
    readyItems,
    skippedItems,
    boughtItems,
    loading,
    error,
    refetch: fetchItems,
    addItem,
    updateItem,
    deleteItem,
    markAsSkipped,
    markAsBought,
  };
}
