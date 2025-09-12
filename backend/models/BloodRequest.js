const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  bloodType: {
    type: String,
    required: [true, 'Blood type is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  unitsRequired: {
    type: Number,
    required: [true, 'Units required is required'],
    min: [1, 'At least 1 unit is required'],
    max: [10, 'Cannot request more than 10 units at once']
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  hospital: {
    name: {
      type: String,
      required: [true, 'Hospital name is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    contact: {
      phone: String,
      email: String
    }
  },
  contactPerson: {
    name: {
      type: String,
      required: [true, 'Contact person name is required']
    },
    phone: {
      type: String,
      required: [true, 'Contact person phone is required']
    },
    relationship: {
      type: String,
      required: [true, 'Relationship to patient is required']
    }
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'fulfilled', 'cancelled', 'expired'],
    default: 'pending'
  },
  matchedDonors: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending'
    },
    matchedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  fulfilledUnits: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 7); // 7 days from now
      return date;
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
bloodRequestSchema.index({ bloodType: 1, status: 1, createdAt: -1 });
bloodRequestSchema.index({ 'hospital.address.city': 1, bloodType: 1 });
bloodRequestSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if request is expired
bloodRequestSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiryDate;
});

// Method to check if request can be fulfilled
bloodRequestSchema.methods.canBeFulfilled = function() {
  return this.status === 'pending' && 
         this.fulfilledUnits < this.unitsRequired && 
         !this.isExpired;
};

// Method to get available units needed
bloodRequestSchema.methods.getUnitsNeeded = function() {
  return this.unitsRequired - this.fulfilledUnits;
};

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
