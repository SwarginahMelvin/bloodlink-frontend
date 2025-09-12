const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest',
    required: true
  },
  donationDate: {
    type: Date,
    required: true
  },
  location: {
    name: {
      type: String,
      required: true
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
    }
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  volume: {
    type: Number,
    required: true,
    min: [350, 'Minimum donation volume is 350ml'],
    max: [450, 'Maximum donation volume is 450ml'],
    default: 450
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'deferred'],
    default: 'scheduled'
  },
  healthCheck: {
    hemoglobin: {
      type: Number,
      min: [12.5, 'Hemoglobin level too low for donation']
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    pulse: Number,
    temperature: Number,
    weight: Number,
    passed: {
      type: Boolean,
      default: false
    },
    notes: String
  },
  postDonation: {
    recoveryTime: Number, // in minutes
    complications: [String],
    notes: String,
    followUpRequired: {
      type: Boolean,
      default: false
    }
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
donationSchema.index({ donor: 1, donationDate: -1 });
donationSchema.index({ bloodRequest: 1 });
donationSchema.index({ status: 1, donationDate: -1 });

// Virtual for checking if donation is recent
donationSchema.virtual('isRecent').get(function() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return this.donationDate > threeMonthsAgo;
});

// Method to check if donor is eligible
donationSchema.statics.checkEligibility = function(donorId) {
  return this.findOne({
    donor: donorId,
    status: 'completed',
    donationDate: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // 90 days ago
  });
};

module.exports = mongoose.model('Donation', donationSchema);
