import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { WaffleColors } from '@/constants/theme';

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 1 of 3</Text>
        <Text style={styles.title}>What's your name?</Text>
        <Text style={styles.subtitle}>
          This is how your friends will see you
        </Text>
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor={WaffleColors.charcoal}
          value={name}
          onChangeText={setName}
          autoFocus
        />
        <View style={styles.inputUnderline} />
      </View>

      {/* Decorative scribble */}
      <View style={styles.scribbleContainer}>
        <Text style={styles.scribble}>{"~ ( ^_^ ) ~"}</Text>
      </View>

      {/* Continue button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => router.push('/onboarding/photo')}
        activeOpacity={0.8}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WaffleColors.white,
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 48,
  },
  progressDot: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: WaffleColors.dustGrey,
  },
  progressDotActive: {
    backgroundColor: WaffleColors.yellow,
  },
  header: {
    marginBottom: 48,
  },
  stepLabel: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: WaffleColors.charcoal,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 32,
  },
  input: {
    fontSize: 24,
    color: WaffleColors.carbonBlack,
    paddingVertical: 16,
    fontWeight: '500',
  },
  inputUnderline: {
    height: 3,
    backgroundColor: WaffleColors.carbonBlack,
    borderRadius: 2,
  },
  scribbleContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  scribble: {
    fontSize: 24,
    color: WaffleColors.charcoal,
    opacity: 0.4,
  },
  continueButton: {
    backgroundColor: WaffleColors.yellow,
    paddingVertical: 18,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 48,
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
});
