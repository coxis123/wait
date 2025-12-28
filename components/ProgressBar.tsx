import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius } from '../lib/constants';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showGradient?: boolean;
}

export function ProgressBar({
  progress,
  height = 8,
  showGradient = true,
}: ProgressBarProps) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(100, Math.max(0, progress)), {
      duration: 500,
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.progressContainer, animatedStyle]}>
        {showGradient ? (
          <LinearGradient
            colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        ) : (
          <View style={[styles.gradient, { backgroundColor: Colors.primary }]} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressContainer: {
    height: '100%',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: BorderRadius.full,
  },
});
