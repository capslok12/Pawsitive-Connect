// models/Report.js
const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
});

const ReportSchema = new mongoose.Schema({
    finder: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: false 
    },
    photoURL: { type: String, required: true },
    description: { type: String, trim: true, maxlength: 500 },
    location: { type: pointSchema, required: true, index: '2dsphere' },
    issueType: { type: String, enum: ['Injured', 'Starving', 'Lost', 'Other'], default: 'Other' },
    animalType: { type: String, enum: ['Dog', 'Cat', 'Bird', 'Other', 'Unknown'], default: 'Unknown' },
    injurySeverity: { type: String, enum: ['Low', 'Medium', 'High', 'Unknown'], default: 'Unknown' },
    status: { type: String, enum: ['Awaiting Triage', 'Triage Complete', 'Rescuer Dispatched', 'Case Closed'], default: 'Awaiting Triage' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
