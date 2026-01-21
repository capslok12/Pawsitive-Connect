const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  photoURL: { type: String, required: true },
  description: { type: String, default: '' },
  issueType: { 
    type: String, 
    enum: ['Injured', 'Starving', 'Lost', 'Other'],
    default: 'Other'
  },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Under Treatment', 'Ready for Adoption', 'Adopted'],
    default: 'Pending'
  },
  recoveryPhotoURL: { type: String, default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedVet: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  healthInfo: { type: String, default: '' },
  animalName: { type: String, default: '' },
  animalType: { type: String, default: '' },
  injurySeverity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  firstAidSuggestions: { type: String, default: '' },
  
  // Contact information
  reporterContact: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  
  // Vet interaction
  vetNotes: { type: String, default: '' },
  treatmentPlan: { type: String, default: '' },
  estimatedRecoveryTime: { type: String, default: '' },
  
  // Adoption fields
  isForAdoption: { type: Boolean, default: false },
  adoptionInfo: {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contactPerson: { 
      type: String, 
      enum: ['reporter', 'vet'],
      default: 'reporter'
    },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    location: { type: String, default: '' },
    adoptionFee: { type: Number, default: 0 },
    requirements: { type: String, default: '' }
  },
  
  adoptionRequests: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    contactInfo: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' }
    },
    createdAt: { type: Date, default: Date.now }
  }],
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);