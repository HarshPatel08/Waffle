import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { WaffleColors } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';
import { WaffleBackground } from '@/components/waffle-background';

// Simple client-side profanity check
const profanityList = [
  'ass', 'asshole', 'bastard', 'bitch', 'bollocks', 'bullshit', 'cock', 'crap',
  'cunt', 'damn', 'dick', 'douche', 'fag', 'fuck', 'goddamn', 'hell', 'homo',
  'jerk', 'nigger', 'nigga', 'piss', 'prick', 'pussy', 'retard', 'shit', 'slut',
  'twat', 'whore', 'wanker',
];

function containsProfanity(name: string): boolean {
  const lowerName = name.toLowerCase().replace(/[^a-z]/g, '');
  return profanityList.some((word) => lowerName.includes(word));
}

export default function NameScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [name, setName] = useState(data.name);
  const [error, setError] = useState('');

  const handleContinue = () => {
    // Validate name
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Name cannot exceed 50 characters');
      return;
    }

    if (containsProfanity(trimmedName)) {
      setError('Please choose an appropriate name');
      return;
    }

    // Save and continue
    updateData({ name: trimmedName });
    router.push('/onboarding/email');
  };

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
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 1 of 4</Text>
        <Text style={styles.title}>What's your name?</Text>
        <Text style={styles.subtitle}>This is how your friends will see you</Text>
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor={WaffleColors.charcoal}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError('');
          }}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
        />
        <View style={[styles.inputUnderline, error && styles.inputUnderlineError]} />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Decorative scribble */}
      <View style={styles.scribbleContainer}>
        <Text style={styles.scribble}>{"~ ( ^_^ ) ~"}</Text>
      </View>

      {/* Continue button */}
      <TouchableOpacity
        style={[styles.continueButton, !name.trim() && styles.continueButtonDisabled]}
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
    marginBottom: 48,
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
