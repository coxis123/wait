import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, WaitItem, InsertWaitItem, UpdateWaitItem, ProfileUpdate } from './database.types';

// Mock user for testing
const MOCK_USER_ID = 'mock-user-123';
const MOCK_USER = {
  id: MOCK_USER_ID,
  email: 'test@example.com',
};

// Storage keys
const KEYS = {
  PROFILE: 'wait_profile',
  ITEMS: 'wait_items',
  IS_LOGGED_IN: 'wait_logged_in',
};

// Default profile
const DEFAULT_PROFILE: Profile = {
  id: MOCK_USER_ID,
  created_at: new Date().toISOString(),
  display_name: 'Test User',
  total_saved: 0,
  items_skipped: 0,
  current_streak: 0,
  longest_streak: 0,
  last_decision_date: null,
  push_token: null,
};

// Helper to generate UUID
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Mock Supabase client
export const mockSupabase = {
  auth: {
    getSession: async () => {
      const isLoggedIn = await AsyncStorage.getItem(KEYS.IS_LOGGED_IN);
      if (isLoggedIn === 'true') {
        return {
          data: {
            session: {
              user: MOCK_USER,
              access_token: 'mock-token',
            },
          },
          error: null,
        };
      }
      return { data: { session: null }, error: null };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Check initial state
      AsyncStorage.getItem(KEYS.IS_LOGGED_IN).then((isLoggedIn) => {
        if (isLoggedIn === 'true') {
          callback('SIGNED_IN', { user: MOCK_USER });
        }
      });

      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Accept any credentials for testing
      await AsyncStorage.setItem(KEYS.IS_LOGGED_IN, 'true');

      // Initialize profile if doesn't exist
      const existingProfile = await AsyncStorage.getItem(KEYS.PROFILE);
      if (!existingProfile) {
        await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify({
          ...DEFAULT_PROFILE,
          display_name: email.split('@')[0],
        }));
      }

      return {
        data: { user: MOCK_USER, session: { user: MOCK_USER } },
        error: null,
      };
    },

    signUp: async ({ email, password, options }: any) => {
      await AsyncStorage.setItem(KEYS.IS_LOGGED_IN, 'true');

      const displayName = options?.data?.display_name || email.split('@')[0];
      await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify({
        ...DEFAULT_PROFILE,
        display_name: displayName,
      }));

      return {
        data: { user: MOCK_USER, session: { user: MOCK_USER } },
        error: null,
      };
    },

    signInWithIdToken: async () => {
      await AsyncStorage.setItem(KEYS.IS_LOGGED_IN, 'true');

      const existingProfile = await AsyncStorage.getItem(KEYS.PROFILE);
      if (!existingProfile) {
        await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      }

      return {
        data: { user: MOCK_USER, session: { user: MOCK_USER } },
        error: null,
      };
    },

    signOut: async () => {
      await AsyncStorage.setItem(KEYS.IS_LOGGED_IN, 'false');
      return { error: null };
    },
  },

  from: (table: string) => {
    if (table === 'profiles') {
      return {
        select: () => ({
          eq: () => ({
            single: async () => {
              const profile = await AsyncStorage.getItem(KEYS.PROFILE);
              return {
                data: profile ? JSON.parse(profile) : null,
                error: null,
              };
            },
          }),
        }),

        insert: async (data: any) => {
          await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify({
            ...DEFAULT_PROFILE,
            ...data,
          }));
          return { error: null };
        },

        update: (updates: ProfileUpdate) => ({
          eq: async (_field: string, _value: string) => {
            const profile = await AsyncStorage.getItem(KEYS.PROFILE);
            const current = profile ? JSON.parse(profile) : DEFAULT_PROFILE;
            const updated = { ...current, ...updates };
            await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(updated));
            return { error: null };
          },
        }),
      };
    }

    if (table === 'wait_items') {
      return {
        select: () => ({
          eq: (_field: string, _value: string) => ({
            order: async () => {
              const items = await AsyncStorage.getItem(KEYS.ITEMS);
              return {
                data: items ? JSON.parse(items) : [],
                error: null,
              };
            },
            single: async () => {
              const items = await AsyncStorage.getItem(KEYS.ITEMS);
              const allItems: WaitItem[] = items ? JSON.parse(items) : [];
              const item = allItems.find((i) => i.id === _value);
              return { data: item || null, error: null };
            },
          }),
        }),

        insert: (data: InsertWaitItem) => ({
          select: () => ({
            single: async () => {
              const items = await AsyncStorage.getItem(KEYS.ITEMS);
              const allItems: WaitItem[] = items ? JSON.parse(items) : [];

              const newItem: WaitItem = {
                id: generateId(),
                user_id: MOCK_USER_ID,
                created_at: new Date().toISOString(),
                name: data.name,
                price: data.price,
                url: data.url || null,
                note: data.note || null,
                wait_days: data.wait_days || 30,
                decision_due_at: data.decision_due_at,
                status: 'waiting',
                decided_at: null,
                reminder_sent: false,
              };

              allItems.unshift(newItem);
              await AsyncStorage.setItem(KEYS.ITEMS, JSON.stringify(allItems));

              return { data: newItem, error: null };
            },
          }),
        }),

        update: (updates: UpdateWaitItem) => ({
          eq: (_field: string, id: string) => ({
            select: () => ({
              single: async () => {
                const items = await AsyncStorage.getItem(KEYS.ITEMS);
                const allItems: WaitItem[] = items ? JSON.parse(items) : [];

                const index = allItems.findIndex((i) => i.id === id);
                if (index !== -1) {
                  allItems[index] = { ...allItems[index], ...updates };
                  await AsyncStorage.setItem(KEYS.ITEMS, JSON.stringify(allItems));
                  return { data: allItems[index], error: null };
                }

                return { data: null, error: { message: 'Item not found' } };
              },
            }),
          }),
        }),

        delete: () => ({
          eq: async (_field: string, id: string) => {
            const items = await AsyncStorage.getItem(KEYS.ITEMS);
            const allItems: WaitItem[] = items ? JSON.parse(items) : [];
            const filtered = allItems.filter((i) => i.id !== id);
            await AsyncStorage.setItem(KEYS.ITEMS, JSON.stringify(filtered));
            return { error: null };
          },
        }),
      };
    }

    return {};
  },
};

// Export mock user for reference
export { MOCK_USER_ID, MOCK_USER };
