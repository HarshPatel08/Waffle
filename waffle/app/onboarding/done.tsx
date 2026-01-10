import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { WaffleColors } from '@/constants/theme';

export default function DoneScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
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
          Welcome to Waffle. Start sharing{'\n'}life moments with your friends.
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
        onPress={() => router.replace('/(tabs)')}
        activeOpacity={0.8}
      >
        <Text style={styles.startText}>Start Waffling</Text>
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
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 48,
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
});
