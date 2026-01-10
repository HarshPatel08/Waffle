import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { WaffleColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.success) {
        router.replace('/(tabs)');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🧇</Text>
        </View>
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      {/* Email input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={WaffleColors.charcoal}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />
        <View style={styles.inputUnderline} />
      </View>

      {/* Password input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={WaffleColors.charcoal}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry={!showPassword}
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
        <View style={[styles.inputUnderline, error && styles.inputUnderlineError]} />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Decorative scribble */}
      <View style={styles.scribbleContainer}>
        <Text style={styles.scribble}>{"~ welcome back ~"}</Text>
      </View>

      {/* Sign in button */}
      <TouchableOpacity
        style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
        onPress={handleSignIn}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={WaffleColors.carbonBlack} />
        ) : (
          <Text style={styles.signInText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Create account link */}
      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={() => router.replace('/onboarding/name')}
      >
        <Text style={styles.createAccountText}>Don't have an account? Create one</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WaffleColors.white,
    paddingHorizontal: 32,
    paddingTop: 60,
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
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: WaffleColors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: WaffleColors.charcoal,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: WaffleColors.charcoal,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: WaffleColors.carbonBlack,
    paddingVertical: 12,
    fontWeight: '500',
  },
  showButton: {
    padding: 8,
  },
  showButtonText: {
    fontSize: 20,
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
    fontSize: 16,
    color: WaffleColors.charcoal,
    opacity: 0.4,
    fontStyle: 'italic',
  },
  signInButton: {
    backgroundColor: WaffleColors.yellow,
    paddingVertical: 18,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    alignItems: 'center',
    marginTop: 'auto',
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInText: {
    fontSize: 18,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  createAccountButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 32,
  },
  createAccountText: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    textDecorationLine: 'underline',
  },
});
