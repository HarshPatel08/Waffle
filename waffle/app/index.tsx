import { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { WaffleColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { WaffleBackground } from '@/components/waffle-background';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, debugSkipAuth, signOut, user } = useAuth();

  const handleDebugSkip = async () => {
    await debugSkipAuth();
    router.replace('/(tabs)');
  };

  const handleClearCache = async () => {
    await signOut();
  };

  useEffect(() => {
    // If user is already authenticated, go to home
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <>
        <WaffleBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={WaffleColors.yellow} />
        </View>
      </>
    );
  }

  return (
    <>
      <WaffleBackground />
      <View style={styles.container}>
      {/* Decorative scribbles */}
      <View style={styles.scribbleTop}>
        <Text style={styles.scribbleText}>~ ~ ~</Text>
      </View>

      {/* Logo and Title */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🧇</Text>
        </View>
        <Text style={styles.title}>Waffle</Text>
        <Text style={styles.subtitle}>
          Stay connected with the people{'\n'}who matter most
        </Text>
      </View>

      {/* Tagline */}
      <View style={styles.taglineContainer}>
        <Text style={styles.tagline}>
          Share daily vlogs. See life updates.{'\n'}No endless scrolling.
        </Text>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push('/onboarding/name')}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>Get Started</Text>
      </TouchableOpacity>

      {/* Sign in link */}
      <TouchableOpacity
        style={styles.signInButton}
        onPress={() => router.push('/signin')}
      >
        <Text style={styles.signInText}>Already have an account? Sign in</Text>
      </TouchableOpacity>

      {/* Debug buttons */}
      <View style={styles.debugContainer}>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={handleDebugSkip}
        >
          <Text style={styles.debugText}>Skip to App (Debug)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.debugButton, styles.clearCacheButton]}
          onPress={handleClearCache}
        >
          <Text style={styles.debugText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>

      {/* Decorative scribbles bottom */}
      <View style={styles.scribbleBottom}>
        <Text style={styles.scribbleText}>* * *</Text>
      </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scribbleTop: {
    position: 'absolute',
    top: 80,
  },
  scribbleBottom: {
    position: 'absolute',
    bottom: 60,
  },
  scribbleText: {
    fontSize: 24,
    color: WaffleColors.charcoal,
    opacity: 0.3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: WaffleColors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    // Scribble style shadow
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: WaffleColors.charcoal,
    textAlign: 'center',
    lineHeight: 26,
  },
  taglineContainer: {
    backgroundColor: WaffleColors.parchment,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    borderStyle: 'dashed',
    marginBottom: 48,
  },
  tagline: {
    fontSize: 16,
    color: WaffleColors.carbonBlack,
    textAlign: 'center',
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: WaffleColors.yellow,
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    marginBottom: 16,
    // Scribble style shadow
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  signInButton: {
    paddingVertical: 12,
  },
  signInText: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    textDecorationLine: 'underline',
  },
  debugContainer: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
  },
  debugButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: WaffleColors.dustGrey,
    borderRadius: 8,
  },
  clearCacheButton: {
    backgroundColor: '#e53935',
  },
  debugText: {
    fontSize: 12,
    color: WaffleColors.charcoal,
  },
});
