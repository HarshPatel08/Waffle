import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  useMicrophonePermissions,
} from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WaffleColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { uploadService, UploadProgress } from '@/services/upload';

const MAX_DURATION = 120; // 2 minutes
const MIN_DURATION = 5; // 5 seconds minimum

export default function RecordScreen() {
  const router = useRouter();
  const { groupId, prompt } = useLocalSearchParams<{
    groupId: string;
    prompt: string;
  }>();
  const { user } = useAuth();

  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [facing, setFacing] = useState<CameraType>('front');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= MAX_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      await requestCameraPermission();
      await requestMicPermission();
    })();
  }, []);

  const startRecording = async () => {
    if (!cameraRef.current) return;

    setIsRecording(true);
    setRecordingDuration(0);

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: MAX_DURATION,
      });
      if (video) {
        setRecordedUri(video.uri);
      }
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to record video');
    }

    setIsRecording(false);
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const handleUpload = async () => {
    if (!recordedUri || !user || !groupId) {
      Alert.alert('Error', 'Missing required data for upload');
      return;
    }

    if (recordingDuration < MIN_DURATION) {
      Alert.alert('Too Short', `Please record at least ${MIN_DURATION} seconds`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadService.uploadVlog(
        recordedUri,
        user.id,
        groupId,
        recordingDuration,
        prompt || '',
        (progress: UploadProgress) => setUploadProgress(progress.percentage)
      );

      if (result.success) {
        Alert.alert('Success', 'Your vlog has been posted!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to save vlog');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        'Please check your connection and try again'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const retake = () => {
    setRecordedUri(null);
    setRecordingDuration(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Permissions check
  if (!cameraPermission?.granted || !micPermission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📹</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          To record vlogs, please allow camera and microphone access
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => {
            requestCameraPermission();
            requestMicPermission();
          }}
        >
          <Text style={styles.permissionButtonText}>Grant Permissions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} mode="video">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Text style={styles.headerButtonText}>X</Text>
          </TouchableOpacity>

          <View style={styles.timerContainer}>
            <View
              style={[styles.timerDot, isRecording && styles.timerDotActive]}
            />
            <Text style={styles.timerText}>
              {formatTime(recordingDuration)} / {formatTime(MAX_DURATION)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
          >
            <Text style={styles.headerButtonText}>Flip</Text>
          </TouchableOpacity>
        </View>

        {/* Prompt */}
        {prompt && (
          <View style={styles.promptContainer}>
            <Text style={styles.promptLabel}>Today's prompt:</Text>
            <Text style={styles.promptText}>"{prompt}"</Text>
          </View>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>REC</Text>
          </View>
        )}
      </CameraView>

      {/* Controls */}
      <View style={styles.controls}>
        {recordedUri ? (
          // Post-recording controls
          <>
            <TouchableOpacity style={styles.retakeButton} onPress={retake}>
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.uploadButton,
                isUploading && styles.uploadingButton,
              ]}
              onPress={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <Text style={styles.uploadText}>{uploadProgress}%</Text>
              ) : (
                <Text style={styles.uploadText}>Post</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          // Recording controls
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordingButtonActive,
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <View style={styles.stopIcon} />
            ) : (
              <View style={styles.recordIcon} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Upload progress overlay */}
      {isUploading && (
        <View style={styles.uploadOverlay}>
          <View style={styles.progressContainer}>
            <View
              style={[styles.progressBar, { width: `${uploadProgress}%` }]}
            />
          </View>
          <Text style={styles.uploadingText}>Uploading your vlog...</Text>
          <Text style={styles.uploadingSubtext}>
            This may take a moment on slow connections
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WaffleColors.carbonBlack,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: WaffleColors.white,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WaffleColors.charcoal,
  },
  timerDotActive: {
    backgroundColor: '#ff4444',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: WaffleColors.white,
  },
  promptContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: WaffleColors.yellow,
  },
  promptLabel: {
    fontSize: 12,
    color: WaffleColors.yellow,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  promptText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: WaffleColors.white,
    textAlign: 'center',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.8)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: WaffleColors.white,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '700',
    color: WaffleColors.white,
    letterSpacing: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
    gap: 24,
    backgroundColor: WaffleColors.carbonBlack,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: WaffleColors.white,
    borderWidth: 4,
    borderColor: WaffleColors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButtonActive: {
    borderColor: '#ff4444',
  },
  recordIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff4444',
  },
  stopIcon: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#ff4444',
  },
  retakeButton: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: WaffleColors.white,
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
    color: WaffleColors.white,
  },
  uploadButton: {
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: WaffleColors.yellow,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  uploadingButton: {
    opacity: 0.7,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: WaffleColors.charcoal,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: WaffleColors.yellow,
  },
  uploadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: WaffleColors.white,
  },
  uploadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: WaffleColors.charcoal,
  },
  // Permission screen styles
  permissionContainer: {
    flex: 1,
    backgroundColor: WaffleColors.carbonBlack,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  permissionEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: WaffleColors.white,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: WaffleColors.charcoal,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: WaffleColors.yellow,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  backLink: {
    marginTop: 20,
    padding: 12,
  },
  backLinkText: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    textDecorationLine: 'underline',
  },
});
