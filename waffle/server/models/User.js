const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't include password in queries by default
      // Note: minlength/maxlength not used here because bcrypt hash is ~60 chars
      // Password length validation is done in the route handler before hashing
    },
    emoji: {
      type: String,
      default: '😊',
    },
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    console.log('[USER] Hashing password...');
    const salt = await bcrypt.genSalt(10);
    console.log('[USER] Salt generated');
    this.password = await bcrypt.hash(this.password, salt);
    console.log('[USER] Password hashed successfully');
  } catch (error) {
    console.error('[USER] Bcrypt error:', error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
