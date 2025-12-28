import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWaitItems, ItemStatus } from '../../hooks/useWaitItems';
import { WaitItemCard } from '../../components/WaitItemCard';
import { Colors, Spacing, FontSize, BorderRadius, isReady } from '../../lib/constants';

const FILTERS: { label: string; value: ItemStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Waiting', value: 'waiting' },
  { label: 'Skipped', value: 'skipped' },
  { label: 'Bought', value: 'bought' },
];

export default function ListScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<ItemStatus>('all');
  const { items, loading, refetch, deleteItem } = useWaitItems();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'waiting') return item.status === 'waiting';
    if (filter === 'skipped') return item.status === 'skipped';
    if (filter === 'bought') return item.status === 'bought';
    return true;
  });

  const getCounts = () => ({
    all: items.length,
    waiting: items.filter((i) => i.status === 'waiting').length,
    skipped: items.filter((i) => i.status === 'skipped').length,
    bought: items.filter((i) => i.status === 'bought').length,
  });

  const counts = getCounts();

  const handleItemPress = (itemId: string, status: string, dueDate: string) => {
    if (status === 'waiting' && isReady(dueDate)) {
      router.push(`/decide/${itemId}`);
    }
  };

  const handleLongPress = (itemId: string, itemName: string) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteItem(itemId),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Your Items</Text>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterTab,
                filter === f.value && styles.filterTabActive,
              ]}
              onPress={() => setFilter(f.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f.value && styles.filterTextActive,
                ]}
              >
                {f.label} ({counts[f.value]})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        {filteredItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onLongPress={() => handleLongPress(item.id, item.name)}
            delayLongPress={500}
          >
            <WaitItemCard
              item={item}
              onPress={() =>
                handleItemPress(item.id, item.status, item.decision_due_at)
              }
            />
          </TouchableOpacity>
        ))}

        {filteredItems.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        )}

        {/* Bottom padding for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  filterContainer: {
    paddingBottom: Spacing.md,
  },
  filterScroll: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    marginRight: Spacing.sm,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
