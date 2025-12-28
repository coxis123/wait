import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWaitItems } from '../hooks/useWaitItems';
import { Button } from '../components/Button';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  WaitPeriodOptions,
} from '../lib/constants';

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const { addItem } = useWaitItems();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [waitDays, setWaitDays] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);

    const decisionDueAt = new Date();
    decisionDueAt.setDate(decisionDueAt.getDate() + waitDays);

    const { error } = await addItem({
      name: name.trim(),
      price: priceValue,
      url: url.trim() || null,
      note: note.trim() || null,
      wait_days: waitDays,
      decision_due_at: decisionDueAt.toISOString(),
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message || 'Failed to add item');
    } else {
      Alert.alert(
        'Added! 👋',
        `See you in ${waitDays} days`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Add to Wait List</Text>

        {/* Item Name */}
        <View style={styles.field}>
          <Text style={styles.label}>What do you want to buy?</Text>
          <TextInput
            style={styles.input}
            placeholder="Sony headphones"
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        {/* Price */}
        <View style={styles.field}>
          <Text style={styles.label}>How much is it?</Text>
          <TextInput
            style={styles.input}
            placeholder="349.00"
            placeholderTextColor={Colors.textTertiary}
            value={price}
            onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            inputAccessoryViewID="price"
          />
          <Text style={styles.inputPrefix}>£</Text>
        </View>

        {/* URL */}
        <View style={styles.field}>
          <Text style={styles.label}>Link (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://amazon.co.uk/..."
            placeholderTextColor={Colors.textTertiary}
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {/* Note */}
        <View style={styles.field}>
          <Text style={styles.label}>Why do you want this?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="I've been thinking about these for ages..."
            placeholderTextColor={Colors.textTertiary}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.hint}>
            ↑ You'll see this again in {waitDays} days
          </Text>
        </View>

        {/* Wait Period */}
        <View style={styles.field}>
          <Text style={styles.label}>How long will you wait?</Text>
          <View style={styles.waitOptions}>
            {WaitPeriodOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.waitOption,
                  waitDays === option.value && styles.waitOptionActive,
                ]}
                onPress={() => setWaitDays(option.value)}
              >
                <Text
                  style={[
                    styles.waitOptionText,
                    waitDays === option.value && styles.waitOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <Button
          title="Wait on it 🤚"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: Spacing.md,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: FontSize.xl,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xxl,
    marginTop: Spacing.xl,
  },
  field: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  inputPrefix: {
    position: 'absolute',
    left: Spacing.lg,
    bottom: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.lg,
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  waitOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  waitOption: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  waitOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  waitOptionText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  waitOptionTextActive: {
    color: Colors.white,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});
