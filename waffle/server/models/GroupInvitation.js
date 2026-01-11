const mongoose = require('mongoose');

const GroupInvitationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    groupName: {
        type: String,
        required: true
    },
    invitedUsers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending'
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'active'], // active means the group has been created
        default: 'pending'
    },
    createdGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GroupInvitation', GroupInvitationSchema);
