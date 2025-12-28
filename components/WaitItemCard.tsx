import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WaitItem } from '../lib/database.types';
import { ProgressBar } from './ProgressBar';
import {
  Colors,
  BorderRadius,
  Spacing,
  FontSize,
  formatCurrency,
  daysRemaining,
  isReady,
  progressPercentage,
} from '../lib/constants';

interface WaitItemCardProps {
  item: WaitItem;
  onPress: () => void;
  variant?: 'default' | 'ready' | 'completed';
}

const getItemEmoji = (name: string): string => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('headphone') || lowercaseName.includes('airpod') || lowercaseName.includes('earphone')) return '🎧';
  if (lowercaseName.includes('shoe') || lowercaseName.includes('nike') || lowercaseName.includes('adidas') || lowercaseName.includes('sneaker')) return '👟';
  if (lowercaseName.includes('watch')) return '⌚';
  if (lowercaseName.includes('phone') || lowercaseName.includes('iphone')) return '📱';
  if (lowercaseName.includes('laptop') || lowercaseName.includes('macbook') || lowercaseName.includes('computer')) return '💻';
  if (lowercaseName.includes('camera')) return '📷';
  if (lowercaseName.includes('bag') || lowercaseName.includes('backpack')) return '🎒';
  if (lowercaseName.includes('jacket') || lowercaseName.includes('coat')) return '🧥';
  if (lowercaseName.includes('game') || lowercaseName.includes('playstation') || lowercaseName.includes('xbox') || lowercaseName.includes('nintendo')) return '🎮';
  if (lowercaseName.includes('book')) return '📚';
  if (lowercaseName.includes('bike') || lowercaseName.includes('bicycle')) return '🚲';
  if (lowercaseName.includes('guitar') || lowercaseName.includes('music')) return '🎸';
  if (lowercaseName.includes('tv') || lowercaseName.includes('television')) return '📺';
  if (lowercaseName.includes('coffee') || lowercaseName.includes('espresso')) return '☕';
  if (lowercaseName.includes('kitchen') || lowercaseName.includes('blender') || lowercaseName.includes('mixer')) return '🍳';
  return '📦';
};

export function WaitItemCard({ item, onPress, variant = 'default' }: WaitItemCardProps) {
  const ready = isReady(item.decision_due_at);
  const remaining = daysRemaining(item.decision_due_at);
  const progress = progressPercentage(item.created_at, item.decision_due_at);
  const emoji = getItemEmoji(item.name);

  if (item.status === 'skipped') {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.completedIcon}>✓</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.completedLabel}>Skipped: </Text>
              <Text style={styles.completedName}>{item.name}</Text>
            </View>
          </View>
          <Text style={styles.savedAmount}>
            Saved {formatCurrency(item.price)} on{' '}
            {new Date(item.decided_at!).toLocaleDateString('en-GB', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (item.status === 'bought') {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.emoji}>{emoji}</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.boughtLabel}>Bought: </Text>
              <Text style={styles.name}>{item.name}</Text>
            </View>
          </View>
          <Text style={styles.boughtAmount}>
            {formatCurrency(item.price)} on{' '}
            {new Date(item.decided_at!).toLocaleDateString('en-GB', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, ready && styles.readyContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {ready && <Text style={styles.arrow}>→</Text>}
        </View>

        <View style={styles.footer}>
          {ready ? (
            <Text style={styles.readyText}>
              Waited {item.wait_days} days • {formatCurrency(item.price)}
            </Text>
          ) : (
            <>
              <View style={styles.progressContainer}>
                <ProgressBar progress={progress} height={6} />
              </View>
              <Text style={styles.daysText}>
                {remaining} days left • {formatCurrency(item.price)}
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  readyContainer: {
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  content: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emoji: {
    fontSize: FontSize.xl,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  arrow: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    gap: Spacing.sm,
  },
  progressContainer: {
    width: '100%',
  },
  daysText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  readyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  titleContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  completedIcon: {
    fontSize: FontSize.lg,
    color: Colors.success,
    fontWeight: '700',
  },
  completedLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  completedName: {
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  savedAmount: {
    fontSize: FontSize.sm,
    color: Colors.success,
  },
  boughtLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  boughtAmount: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
});
