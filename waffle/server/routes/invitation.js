const express = require('express');
const router = express.Router();
const GroupInvitation = require('../models/GroupInvitation');
const Group = require('../models/Group');
const User = require('../models/User');

// @route   POST /api/invitations/create
router.post('/create', async (req, res) => {
    const { senderId, groupName, invitedUserIds, groupId } = req.body;

    try {
        const invitationData = {
            sender: senderId,
            groupName,
            invitedUsers: invitedUserIds.map(id => ({ user: id, status: 'pending' }))
        };

        if (groupId) {
            invitationData.createdGroup = groupId;
            invitationData.status = 'active'; // The group already exists
        }

        const invitation = await GroupInvitation.create(invitationData);

        res.status(201).json({ success: true, invitation });
    } catch (err) {
        console.error('Create invitation error:', err);
        res.status(500).json({ success: false, message: 'Failed to send invitations' });
    }
});

// @route   GET /api/invitations/pending/:userId
router.get('/pending/:userId', async (req, res) => {
    try {
        const invitations = await GroupInvitation.find({
            'invitedUsers': {
                $elemMatch: {
                    user: req.params.userId,
                    status: 'pending'
                }
            },
            status: 'pending' // Only show invites for groups not yet created (or logic can vary)
        })
            .populate('sender', 'name email emoji')
            .sort({ createdAt: -1 });

        res.json({ success: true, invitations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/invitations/respond
router.post('/respond', async (req, res) => {
    const { invitationId, userId, response } = req.body; // response: 'accepted' | 'declined'

    try {
        const invitation = await GroupInvitation.findById(invitationId);
        if (!invitation) {
            return res.status(404).json({ success: false, message: 'Invitation not found' });
        }

        // Update user status
        const participant = invitation.invitedUsers.find(u => u.user.toString() === userId);
        if (!participant) {
            return res.status(403).json({ success: false, message: 'User not invited' });
        }
        participant.status = response;

        if (response === 'accepted') {
            // Check if group already exists
            let group;
            if (invitation.createdGroup) {
                group = await Group.findById(invitation.createdGroup);
                if (group) {
                    // Add user to existing group
                    if (!group.members.includes(userId)) {
                        group.members.push(userId);
                        await group.save();
                    }
                }
            } else {
                // FIRST ACCEPTANCE -> CREATE GROUP
                // Create group with Sender AND Acceptor
                group = await Group.create({
                    name: invitation.groupName,
                    members: [invitation.sender, userId],
                    createdBy: invitation.sender
                });

                // Update invitation
                invitation.createdGroup = group._id;
                invitation.status = 'active';

                // Update Sender's group list? (If User model relies on references, but usually we query Group by members)
                // Adjust User model updates if necessary
            }
        }

        await invitation.save();

        res.json({ success: true, message: `Invitation ${response}` });

    } catch (err) {
        console.error('Respond invitation error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
