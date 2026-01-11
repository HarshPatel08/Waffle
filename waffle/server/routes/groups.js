const express = require('express');
const Group = require('../models/Group');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, emoji, description, createdBy } = req.body;
    console.log('[GROUPS] Creating group:', { name, createdBy });

    if (!name || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Group name and creator ID are required',
      });
    }

    // Create group with creator as first member
    const group = await Group.create({
      name,
      emoji: emoji || '👥',
      description: description || '',
      members: [createdBy],
      createdBy,
    });

    console.log('[GROUPS] Group created:', group._id);

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group: {
        id: group._id,
        name: group.name,
        emoji: group.emoji,
        description: group.description,
        memberCount: group.members.length,
        createdAt: group.createdAt,
      },
    });
  } catch (error) {
    console.error('[GROUPS] Error creating group:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create group',
    });
  }
});

// @route   GET /api/groups/user/:userId
// @desc    Get all groups for a user
// @access  Private
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[GROUPS] Fetching groups for user:', userId);

    const groups = await Group.find({ members: userId })
      .populate('members', 'name emoji')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      groups: groups.map((g) => ({
        id: g._id,
        name: g.name,
        emoji: g.emoji,
        description: g.description,
        memberCount: g.members.length,
        members: g.members.slice(0, 5).map((m) => ({
          id: m._id,
          name: m.name,
          emoji: m.emoji,
        })),
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      })),
    });
  } catch (error) {
    console.error('[GROUPS] Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch groups',
    });
  }
});

// @route   GET /api/groups/:groupId
// @desc    Get a single group by ID
// @access  Private
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate(
      'members',
      'name emoji'
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    res.json({
      success: true,
      group: {
        id: group._id,
        name: group.name,
        emoji: group.emoji,
        description: group.description,
        memberCount: group.members.length,
        members: group.members.map((m) => ({
          id: m._id,
          name: m.name,
          emoji: m.emoji,
        })),
        createdBy: group.createdBy,
        createdAt: group.createdAt,
      },
    });
  } catch (error) {
    console.error('[GROUPS] Error fetching group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group',
    });
  }
});

// @route   POST /api/groups/:groupId/join
// @desc    Add a user to a group
// @access  Private
router.post('/:groupId/join', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this group',
      });
    }

    // Add user to group
    group.members.push(userId);
    await group.save();

    console.log('[GROUPS] User joined group:', { userId, groupId });

    res.json({
      success: true,
      message: 'Successfully joined group',
    });
  } catch (error) {
    console.error('[GROUPS] Error joining group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join group',
    });
  }
});

// @route   POST /api/groups/:groupId/leave
// @desc    Remove a user from a group
// @access  Private
router.post('/:groupId/leave', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Remove user from group
    group.members = group.members.filter((m) => m.toString() !== userId);
    await group.save();

    console.log('[GROUPS] User left group:', { userId, groupId });

    res.json({
      success: true,
      message: 'Successfully left group',
    });
  } catch (error) {
    console.error('[GROUPS] Error leaving group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave group',
    });
  }
});

module.exports = router;
