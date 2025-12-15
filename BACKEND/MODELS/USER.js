const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['public', 'rescuer', 'vet', 'admin'], 
    default: 'public',
    required: true 
  },
  location: {
    lat: { type: Number, default: 23.8103 },
    lng: { type: Number, default: 90.4125 }
  },
  phone: { type: String, default: '' },
  points: { type: Number, default: 0 },
  rescueCount: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  
  // Vet-specific fields
  clinicName: { type: String, default: '' },
  specialization: { type: String, default: 'General' },
  experience: { type: String, default: '' },
  availability: { 
    type: String, 
    enum: ['24/7', 'Business Hours', 'On Call'],
    default: 'Business Hours'
  },
  contactInfo: {
    phone: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  ratings: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);


// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'vet', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
