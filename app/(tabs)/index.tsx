import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Share,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '../../hooks/useProfile';
import { useWaitItems } from '../../hooks/useWaitItems';
import { WaitItemCard } from '../../components/WaitItemCard';
import { Button } from '../../components/Button';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  formatCurrency,
  getTimeOfDay,
} from '../../lib/constants';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const {
    waitingItems,
    readyItems,
    loading: itemsLoading,
    refetch: refetchItems,
  } = useWaitItems();

  const loading = profileLoading || itemsLoading;

  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      refetchItems();
    }, [])
  );

  const handleShare = async () => {
    const message = `🤚 I've saved ${formatCurrency(profile?.total_saved || 0)} by waiting before buying

🔥 ${profile?.current_streak || 0} day streak
📦 ${profile?.items_skipped || 0} impulse purchases skipped

The urge to buy fades. This app proves it.

Try Wait!`;

    await Share.share({ message });
  };

  const handleItemPress = (itemId: string, isReady: boolean) => {
    if (isReady) {
      router.push(`/decide/${itemId}`);
    }
  };

  const displayName = profile?.display_name || 'there';
  const greeting = `Good ${getTimeOfDay()}, ${displayName}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              refetchProfile();
              refetchItems();
            }}
            tintColor={Colors.primary}
          />
        }
      >
        <Text style={styles.greeting}>{greeting}</Text>

        {/* Hero Stats Card */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroStat}>
            <Text style={styles.heroEmoji}>💰</Text>
            <Text style={styles.heroValue}>
              {formatCurrency(profile?.total_saved || 0)}
            </Text>
            <Text style={styles.heroLabel}>saved by waiting</Text>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroStat}>
            <Text style={styles.heroEmoji}>🔥</Text>
            <Text style={styles.heroValue}>{profile?.current_streak || 0} day</Text>
            <Text style={styles.heroLabel}>streak</Text>
          </View>

          <Button
            title="Share your wins"
            onPress={handleShare}
            variant="secondary"
            size="small"
            style={styles.shareButton}
          />
        </LinearGradient>

        {/* Ready to Decide Section */}
        {readyItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>⚡</Text>
              <Text style={styles.sectionTitle}>READY TO DECIDE</Text>
              <Text style={styles.sectionCount}>({readyItems.length})</Text>
            </View>

            {readyItems.map((item) => (
              <WaitItemCard
                key={item.id}
                item={item}
                onPress={() => handleItemPress(item.id, true)}
                variant="ready"
              />
            ))}
          </View>
        )}

        {/* Waiting Section */}
        {waitingItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>⏳</Text>
              <Text style={styles.sectionTitle}>WAITING</Text>
              <Text style={styles.sectionCount}>({waitingItems.length})</Text>
            </View>

            {waitingItems.map((item) => (
              <WaitItemCard
                key={item.id}
                item={item}
                onPress={() => {}}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {!loading && waitingItems.length === 0 && readyItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🤚</Text>
            <Text style={styles.emptyTitle}>No items yet</Text>
            <Text style={styles.emptyText}>
              Next time you want to buy something impulsively, add it here and wait.
            </Text>
            <Button
              title="Add your first item"
              onPress={() => router.push('/add')}
              style={styles.emptyButton}
            />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  heroStat: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  heroValue: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.text,
  },
  heroLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: Spacing.lg,
  },
  shareButton: {
    marginTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionEmoji: {
    fontSize: FontSize.md,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  emptyButton: {
    minWidth: 200,
  },
});
