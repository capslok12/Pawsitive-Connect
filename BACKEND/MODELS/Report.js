// Find your existing Report schema and ADD these fields:

const reportSchema = new mongoose.Schema({
  // ... YOUR EXISTING FIELDS (keep everything) ...
  
  // ADD THESE NEW FIELDS:
  adoptionInfo: {
    contactPerson: {
      type: String,
      enum: ['rescuer', 'vet'],
      default: 'rescuer'
    },
    contactPhone: String,
    contactEmail: String,
    location: String
  },
  
  adoptionRequests: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    contactInfo: {
      phone: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      }
    },
    requestDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    responseMessage: String,
    responseDate: Date
  }],
  
  healthInfo: String,
  recoveryPhotoURL: String,
  animalName: String
  
  // ... rest of your existing fields ...
});
// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  status: {
    type: String,
    enum: [
      'Pending',
      'Rescued',
      'Under Treatment',
      'Ready for Adoption',
      'Adopted',
      'Closed'
    ],
    default: 'Pending'
  },
  
  issueType: {
    type: String,
    enum: [
      'Injured',
      'Sick',
      'Abandoned',
      'Stray',
      'Abused',
      'Other'
    ],
    required: true
  },
  
  animalType: {
    type: String,
    required: true
  },
  
  location: String,
  description: String,
  photoURL: String,
  
  // ... your other existing fields ...
  
}, {
  timestamps: true  // ⚠️ IMPORTANT: This adds createdAt field for monthly stats
});

module.exports = mongoose.model('Report', reportSchema);
