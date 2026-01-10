import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { WaffleColors } from '@/constants/theme';

export default function PhotoScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 2 of 3</Text>
        <Text style={styles.title}>Add a profile photo</Text>
        <Text style={styles.subtitle}>
          Let your friends recognize you
        </Text>
      </View>

      {/* Photo picker area */}
      <TouchableOpacity style={styles.photoContainer} activeOpacity={0.8}>
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoIcon}>📷</Text>
          <Text style={styles.photoText}>Tap to add photo</Text>
        </View>
        {/* Scribble decoration */}
        <View style={styles.photoDecoration}>
          <Text style={styles.decorationText}>{"* click! *"}</Text>
        </View>
      </TouchableOpacity>

      {/* Skip option */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => router.push('/onboarding/done')}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>

      {/* Continue button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => router.push('/onboarding/done')}
        activeOpacity={0.8}
      >
        <Text style={styles.continueText}>Continue</Text>
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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: WaffleColors.parchment,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  photoText: {
    fontSize: 14,
    color: WaffleColors.charcoal,
  },
  photoDecoration: {
    position: 'absolute',
    right: 40,
    top: 20,
    transform: [{ rotate: '15deg' }],
  },
  decorationText: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    fontStyle: 'italic',
    opacity: 0.6,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  skipText: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    textDecorationLine: 'underline',
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
