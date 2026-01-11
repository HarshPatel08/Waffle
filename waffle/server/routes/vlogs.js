const express = require('express');
const { Storage } = require('@google-cloud/storage');
const Vlog = require('../models/Vlog');
const Group = require('../models/Group');

const router = express.Router();

// Initialize GCS
let storage;
try {
  // Try using service account credentials from environment
  if (process.env.GCS_PRIVATE_KEY && process.env.GCS_CLIENT_EMAIL) {
    storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
    console.log('[GCS] Initialized with inline credentials');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use service account JSON file
    storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    console.log('[GCS] Initialized with service account file');
  } else {
    console.warn('[GCS] No credentials found - signed URLs will not work');
  }
} catch (error) {
  console.error('[GCS] Failed to initialize:', error.message);
}

const bucketName = process.env.GCS_BUCKET_NAME || 'waffle-user-videos';

// @route   POST /api/vlogs/upload-url
// @desc    Generate a signed URL for video upload
// @access  Private
router.post('/upload-url', async (req, res) => {
  try {
    const { userId, groupId, contentType = 'video/mp4' } = req.body;
    console.log('[VLOGS] Generating upload URL:', { userId, groupId });

    if (!userId || !groupId) {
      return res.status(400).json({
        success: false,
        message: 'userId and groupId are required',
      });
    }

    if (!storage) {
      return res.status(500).json({
        success: false,
        message: 'Storage service not configured',
      });
    }

    const bucket = storage.bucket(bucketName);

    // Generate unique file path with group prefix
    const timestamp = Date.now();
    const filename = `groups/${groupId}/${userId}/${timestamp}.mp4`;

    // Create file reference
    const file = bucket.file(filename);

    // Generate signed URL for upload (PUT) - 15 minutes expiry
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    });

    // Generate public URL for playback
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

    console.log('[VLOGS] Upload URL generated:', { filename });

    res.json({
      success: true,
      uploadUrl: signedUrl,
      publicUrl,
      gcsPath: filename,
      expiresIn: 900, // 15 minutes in seconds
    });
  } catch (error) {
    console.error('[VLOGS] Error generating upload URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate upload URL',
    });
  }
});

// @route   POST /api/vlogs
// @desc    Create vlog record after successful upload
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { userId, groupId, gcsPath, publicUrl, duration, prompt } = req.body;
    console.log('[VLOGS] Creating vlog record:', { userId, groupId, duration });

    if (!userId || !groupId || !gcsPath || !publicUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const vlog = await Vlog.create({
      userId,
      groupId,
      gcsPath,
      publicUrl,
      duration: duration || 0,
      prompt: prompt || '',
      status: 'ready',
    });

    console.log('[VLOGS] Vlog created:', vlog._id);

    res.status(201).json({
      success: true,
      message: 'Vlog saved successfully',
      vlog: {
        id: vlog._id,
        publicUrl: vlog.publicUrl,
        duration: vlog.duration,
        prompt: vlog.prompt,
        status: vlog.status,
        createdAt: vlog.createdAt,
      },
    });
  } catch (error) {
    console.error('[VLOGS] Error creating vlog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save vlog',
    });
  }
});

// @route   GET /api/vlogs/group/:groupId
// @desc    Get vlogs for a group
// @access  Private
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    console.log('[VLOGS] Fetching vlogs for group:', groupId);

    const vlogs = await Vlog.find({ groupId, status: 'ready' })
      .populate('userId', 'name emoji')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    res.json({
      success: true,
      vlogs: vlogs.map((v) => ({
        id: v._id,
        userId: v.userId._id,
        userName: v.userId.name,
        userEmoji: v.userId.emoji,
        publicUrl: v.publicUrl,
        duration: v.duration,
        prompt: v.prompt,
        createdAt: v.createdAt,
        hasViewed: false, // TODO: Check against current user
      })),
    });
  } catch (error) {
    console.error('[VLOGS] Error fetching vlogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vlogs',
    });
  }
});

// @route   GET /api/vlogs/:vlogId
// @desc    Get a single vlog by ID
// @access  Private
router.get('/:vlogId', async (req, res) => {
  try {
    const { vlogId } = req.params;

    const vlog = await Vlog.findById(vlogId).populate('userId', 'name emoji');

    if (!vlog) {
      return res.status(404).json({
        success: false,
        message: 'Vlog not found',
      });
    }

    res.json({
      success: true,
      vlog: {
        id: vlog._id,
        userId: vlog.userId._id,
        userName: vlog.userId.name,
        userEmoji: vlog.userId.emoji,
        groupId: vlog.groupId,
        publicUrl: vlog.publicUrl,
        duration: vlog.duration,
        prompt: vlog.prompt,
        status: vlog.status,
        createdAt: vlog.createdAt,
      },
    });
  } catch (error) {
    console.error('[VLOGS] Error fetching vlog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vlog',
    });
  }
});

// @route   DELETE /api/vlogs/:vlogId
// @desc    Delete a vlog
// @access  Private
router.delete('/:vlogId', async (req, res) => {
  try {
    const { vlogId } = req.params;
    const { userId } = req.body;

    const vlog = await Vlog.findById(vlogId);

    if (!vlog) {
      return res.status(404).json({
        success: false,
        message: 'Vlog not found',
      });
    }

    // Only allow owner to delete
    if (vlog.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this vlog',
      });
    }

    // Delete from GCS
    if (storage) {
      try {
        const bucket = storage.bucket(bucketName);
        await bucket.file(vlog.gcsPath).delete();
        console.log('[VLOGS] Deleted from GCS:', vlog.gcsPath);
      } catch (gcsError) {
        console.error('[VLOGS] GCS delete error:', gcsError.message);
        // Continue with DB deletion even if GCS fails
      }
    }

    // Delete from database
    await Vlog.findByIdAndDelete(vlogId);
    console.log('[VLOGS] Vlog deleted:', vlogId);

    res.json({
      success: true,
      message: 'Vlog deleted successfully',
    });
  } catch (error) {
    console.error('[VLOGS] Error deleting vlog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vlog',
    });
  }
});

module.exports = router;
