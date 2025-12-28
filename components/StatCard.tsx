import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize } from '../lib/constants';

interface StatCardProps {
  icon?: string;
  value: string | number;
  label: string;
  variant?: 'default' | 'highlight';
}

export function StatCard({ icon, value, label, variant = 'default' }: StatCardProps) {
  return (
    <View style={[styles.container, variant === 'highlight' && styles.highlight]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flex: 1,
  },
  highlight: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  icon: {
    fontSize: FontSize.xl,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
