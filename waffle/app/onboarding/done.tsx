import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { WaffleColors } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';

export default function DoneScreen() {
  const router = useRouter();
  const { data, resetData } = useOnboarding();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [error, setError] = useState('');

  const handleCreateAccount = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signUp({
        name: data.name,
        email: data.email,
        password: data.password,
        emoji: data.emoji,
      });

      if (result.success) {
        setIsCreated(true);
        resetData();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    router.replace('/(tabs)');
  };

  // Show loading/creating state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={WaffleColors.yellow} />
          <Text style={styles.loadingText}>Creating your account...</Text>
          <Text style={styles.loadingScribble}>{"~ almost there ~"}</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.celebrationContainer}>
          <View style={[styles.emojiContainer, styles.emojiContainerError]}>
            <Text style={styles.celebrationEmoji}>😕</Text>
          </View>
          <Text style={styles.title}>Oops!</Text>
          <Text style={styles.subtitle}>{error}</Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleCreateAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.startText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.back()}
        >
          <Text style={styles.backLinkText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show success/ready state
  if (isCreated) {
    return (
      <View style={styles.container}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>

        {/* Celebration */}
        <View style={styles.celebrationContainer}>
          <View style={styles.emojiContainer}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
          </View>
          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.subtitle}>
            Welcome to Waffle, {data.name || 'friend'}!{'\n'}Start sharing life moments.
          </Text>
        </View>

        {/* Features preview */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>📹</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Record daily vlogs</Text>
              <Text style={styles.featureDesc}>1-2 minute life updates</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>👥</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Share with groups</Text>
              <Text style={styles.featureDesc}>Keep close friends in the loop</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>✨</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>AI weekly recaps</Text>
              <Text style={styles.featureDesc}>Never miss a moment</Text>
            </View>
          </View>
        </View>

        {/* Scribble decoration */}
        <Text style={styles.scribble}>{"~ let's go! ~"}</Text>

        {/* Start button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text style={styles.startText}>Start Waffling</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Initial state - prompt to create account
  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Ready state */}
      <View style={styles.celebrationContainer}>
        <View style={styles.emojiContainer}>
          <Text style={styles.celebrationEmoji}>🧇</Text>
        </View>
        <Text style={styles.title}>Ready to join?</Text>
        <Text style={styles.subtitle}>
          Create your account and start{'\n'}connecting with friends.
        </Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Your details</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Name</Text>
          <Text style={styles.summaryValue}>{data.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Email</Text>
          <Text style={styles.summaryValue}>{data.email}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Password</Text>
          <Text style={styles.summaryValue}>{'•'.repeat(data.password.length)}</Text>
        </View>
      </View>

      {/* Create account button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleCreateAccount}
        activeOpacity={0.8}
      >
        <Text style={styles.startText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WaffleColors.white,
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: WaffleColors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
    marginTop: 24,
  },
  loadingScribble: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    opacity: 0.5,
    fontStyle: 'italic',
    marginTop: 8,
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
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: WaffleColors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  emojiContainerError: {
    backgroundColor: WaffleColors.dustGrey,
  },
  celebrationEmoji: {
    fontSize: 48,
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
    textAlign: 'center',
    lineHeight: 24,
  },
  summaryContainer: {
    backgroundColor: WaffleColors.parchment,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: WaffleColors.charcoal,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: WaffleColors.dustGrey,
  },
  summaryLabel: {
    fontSize: 14,
    color: WaffleColors.charcoal,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
  },
  featuresContainer: {
    backgroundColor: WaffleColors.parchment,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    padding: 20,
    gap: 20,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: WaffleColors.white,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 14,
    color: WaffleColors.charcoal,
  },
  scribble: {
    textAlign: 'center',
    fontSize: 16,
    color: WaffleColors.charcoal,
    opacity: 0.5,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  startButton: {
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
  startText: {
    fontSize: 18,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backLinkText: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    textDecorationLine: 'underline',
  },
});
