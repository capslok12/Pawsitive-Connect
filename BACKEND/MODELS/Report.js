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
