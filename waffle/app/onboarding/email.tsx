import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { WaffleColors } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';

function isValidEmail(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email);
}

export default function EmailScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [email, setEmail] = useState(data.email);
  const [error, setError] = useState('');

  const handleContinue = () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your email');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    updateData({ email: trimmedEmail });
    router.push('/onboarding/password');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 2 of 4</Text>
        <Text style={styles.title}>What's your email?</Text>
        <Text style={styles.subtitle}>We'll use this to sign you in</Text>
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={WaffleColors.charcoal}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError('');
          }}
          autoFocus
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={[styles.inputUnderline, error && styles.inputUnderlineError]} />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Decorative scribble */}
      <View style={styles.scribbleContainer}>
        <Text style={styles.scribble}>{"@ ~ @"}</Text>
      </View>

      {/* Continue button */}
      <TouchableOpacity
        style={[styles.continueButton, !email.trim() && styles.continueButtonDisabled]}
        onPress={handleContinue}
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
    marginBottom: 24,
  },
  progressDot: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: WaffleColors.dustGrey,
  },
  progressDotActive: {
    backgroundColor: WaffleColors.yellow,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
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
  inputUnderlineError: {
    backgroundColor: '#e53935',
  },
  errorText: {
    color: '#e53935',
    fontSize: 14,
    marginTop: 8,
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
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
});
