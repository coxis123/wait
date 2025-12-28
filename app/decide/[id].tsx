import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../hooks/useProfile';
import { useWaitItems } from '../../hooks/useWaitItems';
import { WaitItem } from '../../lib/database.types';
import { Button } from '../../components/Button';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  formatCurrency,
} from '../../lib/constants';

export default function DecideScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { updateStreak, addSavedAmount } = useProfile();
  const { markAsSkipped, markAsBought } = useWaitItems();

  const [item, setItem] = useState<WaitItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const celebrationScale = useSharedValue(0);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('wait_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      Alert.alert('Error', 'Item not found');
      router.back();
    } else {
      setItem(data);
    }
    setLoading(false);
  };

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationScale.value,
  }));

  const showCelebrationAnimation = () => {
    setShowCelebration(true);
    celebrationScale.value = withSequence(
      withSpring(1.2, { damping: 5 }),
      withSpring(1, { damping: 10 })
    );

    setTimeout(() => {
      router.back();
    }, 1500);
  };

  const handleSkip = async () => {
    if (!item) return;

    setDeciding(true);
    await markAsSkipped(item.id);
    await addSavedAmount(item.price);
    await updateStreak('skipped');
    setDeciding(false);

    showCelebrationAnimation();
  };

  const handleBuy = async () => {
    if (!item) return;

    setDeciding(true);
    await markAsBought(item.id);
    await updateStreak('bought');
    setDeciding(false);

    if (item.url) {
      Linking.openURL(item.url);
    }

    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Item not found</Text>
      </View>
    );
  }

  if (showCelebration) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Animated.View style={[styles.celebration, celebrationStyle]}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationTitle}>Nice one!</Text>
          <Text style={styles.celebrationText}>
            You saved {formatCurrency(item.price)}
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>⏰</Text>
          <Text style={styles.headerTitle}>Time's up!</Text>
        </View>

        {/* Item Card */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
          style={styles.itemCard}
        >
          <Text style={styles.itemEmoji}>📦</Text>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
        </LinearGradient>

        <Text style={styles.waitedText}>
          You waited {item.wait_days} days
        </Text>

        {/* Note Card */}
        {item.note && (
          <View style={styles.noteCard}>
            <Text style={styles.noteLabel}>💭 You said:</Text>
            <Text style={styles.noteText}>"{item.note}"</Text>
          </View>
        )}

        {/* Question */}
        <Text style={styles.question}>Still want it?</Text>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Button
            title="Nah, I'll skip it 👋"
            onPress={handleSkip}
            variant="secondary"
            loading={deciding}
            style={styles.button}
          />

          <Button
            title="Yes, I'll buy it ✓"
            onPress={handleBuy}
            variant="outline"
            loading={deciding}
            style={styles.button}
          />
        </View>

        {/* Fun fact */}
        <View style={styles.funFact}>
          <Text style={styles.funFactText}>
            💡 78% of people skip after waiting
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    marginTop: Spacing.xl,
  },
  headerEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.text,
  },
  itemCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  itemEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  itemName: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  itemPrice: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  waitedText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  noteCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  noteLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  noteText: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  question: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  buttons: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  button: {
    paddingVertical: Spacing.lg,
  },
  funFact: {
    alignItems: 'center',
  },
  funFactText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  celebration: {
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  celebrationTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  celebrationText: {
    fontSize: FontSize.xl,
    color: Colors.success,
    fontWeight: '600',
  },
});
