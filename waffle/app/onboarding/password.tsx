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
import { WaffleBackground } from '@/components/waffle-background';

export default function PasswordScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password.length > 16) {
      setError('Password cannot exceed 16 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    updateData({ password });
    router.push('/onboarding/done');
  };

  const passwordLength = password.length;
  const isValidLength = passwordLength >= 8 && passwordLength <= 16;

  return (
    <>
      <WaffleBackground />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 3 of 4</Text>
        <Text style={styles.title}>Create a password</Text>
        <Text style={styles.subtitle}>Must be 8-16 characters</Text>
      </View>

      {/* Password input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={WaffleColors.charcoal}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry={!showPassword}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.showButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.showButtonText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputUnderline} />

        {/* Character count */}
        <View style={styles.charCountContainer}>
          <Text style={[styles.charCount, isValidLength && styles.charCountValid]}>
            {passwordLength}/16 characters
          </Text>
        </View>
      </View>

      {/* Confirm password input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor={WaffleColors.charcoal}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setError('');
          }}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={[styles.inputUnderline, error && styles.inputUnderlineError]} />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Decorative scribble */}
      <View style={styles.scribbleContainer}>
        <Text style={styles.scribble}>{"🔒 ~ shh ~"}</Text>
      </View>

      {/* Continue button */}
      <TouchableOpacity
        style={[styles.continueButton, !password && styles.continueButtonDisabled]}
        onPress={handleContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 24,
    color: WaffleColors.carbonBlack,
    paddingVertical: 16,
    fontWeight: '500',
  },
  showButton: {
    padding: 8,
  },
  showButtonText: {
    fontSize: 24,
  },
  inputUnderline: {
    height: 3,
    backgroundColor: WaffleColors.carbonBlack,
    borderRadius: 2,
  },
  inputUnderlineError: {
    backgroundColor: '#e53935',
  },
  charCountContainer: {
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: WaffleColors.charcoal,
  },
  charCountValid: {
    color: '#4caf50',
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
    fontSize: 20,
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
