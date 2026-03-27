// backend/models/CampusClub.js

const mongoose = require('mongoose');

const clubMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['member', 'coordinator', 'president', 'advisor'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const clubEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  date: {
    type: Date,
    required: true
  },
  location: String,
  venue: String,
  startTime: String,
  endTime: String,
  type: {
    type: String,
    enum: ['workshop', 'seminar', 'hackathon', 'meetup', 'social', 'competition', 'cultural'],
    default: 'meetup'
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  maxParticipants: Number,
  currentParticipants: {
    type: Number,
    default: 0
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const clubNewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['announcement', 'event', 'achievement', 'update', 'meeting'],
    default: 'announcement'
  },
  importance: {
    type: String,
    enum: ['normal', 'important', 'urgent'],
    default: 'normal'
  },
  images: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const campusClubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  shortName: String,
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'cultural', 'sports', 'academic', 'social', 'entrepreneurship', 'art', 'music', 'other'],
    required: true
  },
  logo: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  coverImage: {
    type: String,
    default: 'https://via.placeholder.com/1200x300'
  },
  foundedDate: Date,
  motto: String,
  vision: String,
  mission: String,
  facultyAdvisor: {
    name: String,
    email: String,
    department: String,
    phone: String
  },
  studentCoordinators: [{
    name: String,
    role: String,
    email: String,
    phone: String
  }],
  socialLinks: {
    instagram: String,
    linkedin: String,
    github: String,
    discord: String,
    website: String,
    whatsapp: String
  },
  meetingSchedule: {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    time: String,
    venue: String,
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly'],
      default: 'weekly'
    }
  },
  members: [clubMemberSchema],
  events: [clubEventSchema],
  news: [clubNewsSchema],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    image: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps
campusClubSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate slug from name
campusClubSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

module.exports = mongoose.model('CampusClub', campusClubSchema);