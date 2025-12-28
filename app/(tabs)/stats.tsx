import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Share,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '../../hooks/useProfile';
import { useWaitItems } from '../../hooks/useWaitItems';
import { StatCard } from '../../components/StatCard';
import { ProgressBar } from '../../components/ProgressBar';
import { Button } from '../../components/Button';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  formatCurrency,
} from '../../lib/constants';

const getWhatElseCouldBuy = (amount: number) => {
  const items = [];

  if (amount >= 200) {
    items.push(`✈️  ${Math.floor(amount / 150)} return flights to Lisbon`);
  }
  if (amount >= 50) {
    items.push(`🍕 ${Math.floor(amount / 20)} Gozney pizza nights`);
  }
  if (amount >= 1000) {
    items.push(`📱 ${Math.floor(amount / 999)} iPhone`);
  }
  if (amount >= 100) {
    items.push(`☕ ${Math.floor(amount / 5)} fancy coffees`);
  }
  if (amount >= 500) {
    items.push(`🎧 ${Math.floor(amount / 350)} premium headphones`);
  }

  return items.slice(0, 3);
};

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const {
    items,
    skippedItems,
    boughtItems,
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

  const totalDecisions = skippedItems.length + boughtItems.length;
  const skipRate = totalDecisions > 0
    ? Math.round((skippedItems.length / totalDecisions) * 100)
    : 0;

  const avgWaitTime = skippedItems.length > 0
    ? Math.round(
        skippedItems.reduce((sum, item) => sum + item.wait_days, 0) /
          skippedItems.length
      )
    : 0;

  const whatElseItems = getWhatElseCouldBuy(profile?.total_saved || 0);

  const handleShare = async () => {
    const message = `🤚 I've saved ${formatCurrency(profile?.total_saved || 0)} by waiting before buying

🔥 ${profile?.current_streak || 0} day streak
📦 ${profile?.items_skipped || 0} impulse purchases skipped

The urge to buy fades. This app proves it.

Try Wait!`;

    await Share.share({ message });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Your Stats</Text>

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
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              value={formatCurrency(profile?.total_saved || 0)}
              label="saved"
              variant="highlight"
            />
            <StatCard
              icon="🔥"
              value={`${profile?.current_streak || 0} days`}
              label="current streak"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              value={profile?.items_skipped || 0}
              label="items skipped"
            />
            <StatCard
              value={`${avgWaitTime} days`}
              label="avg wait time"
            />
          </View>
        </View>

        {/* Skip Rate */}
        <View style={styles.skipRateSection}>
          <View style={styles.skipRateHeader}>
            <Text style={styles.skipRateLabel}>📊 Skip rate:</Text>
            <Text style={styles.skipRateValue}>{skipRate}%</Text>
          </View>
          <ProgressBar progress={skipRate} height={10} />
        </View>

        {/* What Else Could Buy */}
        {(profile?.total_saved || 0) > 0 && whatElseItems.length > 0 && (
          <View style={styles.whatElseSection}>
            <Text style={styles.whatElseTitle}>
              That {formatCurrency(profile?.total_saved || 0)} could buy:
            </Text>
            <View style={styles.whatElseCard}>
              {whatElseItems.map((item, index) => (
                <Text key={index} style={styles.whatElseItem}>
                  {item}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Share Button */}
        <Button
          title="Share your wins 📤"
          onPress={handleShare}
          style={styles.shareButton}
        />

        {/* Money Kept Section */}
        {skippedItems.length > 0 && (
          <View style={styles.moneyKeptSection}>
            <Text style={styles.moneyKeptTitle}>Money kept 💪</Text>
            <View style={styles.moneyKeptList}>
              {skippedItems.slice(0, 5).map((item) => (
                <View key={item.id} style={styles.moneyKeptItem}>
                  <Text style={styles.moneyKeptName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.moneyKeptAmount}>
                    +{formatCurrency(item.price)}
                  </Text>
                </View>
              ))}
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  statsGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  skipRateSection: {
    marginBottom: Spacing.xl,
  },
  skipRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  skipRateLabel: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  skipRateValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  whatElseSection: {
    marginBottom: Spacing.xl,
  },
  whatElseTitle: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  whatElseCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  whatElseItem: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  shareButton: {
    marginBottom: Spacing.xl,
  },
  moneyKeptSection: {
    marginBottom: Spacing.xl,
  },
  moneyKeptTitle: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  moneyKeptList: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  moneyKeptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moneyKeptName: {
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  moneyKeptAmount: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.success,
  },
});
