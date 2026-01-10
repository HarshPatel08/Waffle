import { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { WaffleColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If user is already authenticated, go to home
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={WaffleColors.yellow} />
      </View>
    );
  }

  return (
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

      {/* Decorative scribbles bottom */}
      <View style={styles.scribbleBottom}>
        <Text style={styles.scribbleText}>* * *</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WaffleColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: WaffleColors.white,
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
});
