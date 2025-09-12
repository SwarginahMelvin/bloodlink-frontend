const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodlink', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await BloodRequest.deleteMany({});
    await Donation.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@bloodlink.com',
      password: 'admin123',
      phone: '9876543210',
      bloodType: 'O+',
      role: 'admin',
      isVerified: true,
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        gender: 'Male',
        weight: 70,
        address: {
          street: '123 Admin Street',
          city: 'Chennai',
          state: 'Tamil Nadu',
          country: 'India',
          pincode: '600001',
          coordinates: {
            latitude: 13.0827,
            longitude: 80.2707
          }
        }
      }
    });

    console.log('👤 Created admin user');

    // Create sample users/donors
    const sampleUsers = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '9876543211',
        bloodType: 'A+',
        role: 'donor',
        isVerified: true,
        isAvailable: true,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          gender: 'Male',
          weight: 75,
          address: {
            street: '456 Main Street',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '600002',
            coordinates: {
              latitude: 13.0827,
              longitude: 80.2707
            }
          }
        }
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '9876543212',
        bloodType: 'B+',
        role: 'donor',
        isVerified: true,
        isAvailable: true,
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
          gender: 'Female',
          weight: 60,
          address: {
            street: '789 Park Avenue',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '600003',
            coordinates: {
              latitude: 13.0827,
              longitude: 80.2707
            }
          }
        }
      },
      {
        username: 'mike_wilson',
        email: 'mike@example.com',
        password: 'password123',
        phone: '9876543213',
        bloodType: 'O-',
        role: 'donor',
        isVerified: true,
        isAvailable: true,
        profile: {
          firstName: 'Mike',
          lastName: 'Wilson',
          gender: 'Male',
          weight: 80,
          address: {
            street: '321 Oak Street',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '600004',
            coordinates: {
              latitude: 13.0827,
              longitude: 80.2707
            }
          }
        }
      },
      {
        username: 'sarah_jones',
        email: 'sarah@example.com',
        password: 'password123',
        phone: '9876543214',
        bloodType: 'AB+',
        role: 'user',
        isVerified: true,
        profile: {
          firstName: 'Sarah',
          lastName: 'Jones',
          gender: 'Female',
          weight: 55,
          address: {
            street: '654 Pine Street',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '600005',
            coordinates: {
              latitude: 13.0827,
              longitude: 80.2707
            }
          }
        }
      }
    ];

    const users = await User.insertMany(sampleUsers);
    console.log(`👥 Created ${users.length} sample users`);

    // Create sample blood requests
    const sampleRequests = [
      {
        requester: users[3]._id, // Sarah Jones
        patientName: 'Robert Johnson',
        bloodType: 'A+',
        unitsRequired: 2,
        urgency: 'high',
        hospital: {
          name: 'Apollo Hospital',
          address: {
            street: '21 Greams Lane',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600006'
          },
          contact: {
            phone: '044-28293333',
            email: 'info@apollohospitals.com'
          }
        },
        contactPerson: {
          name: 'Sarah Jones',
          phone: '9876543214',
          relationship: 'Daughter'
        },
        description: 'Emergency surgery required for heart condition'
      },
      {
        requester: users[3]._id, // Sarah Jones
        patientName: 'Maria Garcia',
        bloodType: 'B+',
        unitsRequired: 1,
        urgency: 'medium',
        hospital: {
          name: 'Fortis Hospital',
          address: {
            street: '154/11, Bannerghatta Road',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600007'
          },
          contact: {
            phone: '044-49222222',
            email: 'info@fortishealthcare.com'
          }
        },
        contactPerson: {
          name: 'Sarah Jones',
          phone: '9876543214',
          relationship: 'Friend'
        },
        description: 'Blood transfusion needed for anemia treatment'
      }
    ];

    const bloodRequests = await BloodRequest.insertMany(sampleRequests);
    console.log(`🩸 Created ${bloodRequests.length} sample blood requests`);

    // Create sample donations
    const sampleDonations = [
      {
        donor: users[0]._id, // John Doe
        bloodRequest: bloodRequests[0]._id,
        donationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        location: {
          name: 'Apollo Hospital Blood Bank',
          address: {
            street: '21 Greams Lane',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600006'
          }
        },
        bloodType: 'A+',
        volume: 450,
        status: 'completed',
        healthCheck: {
          hemoglobin: 14.5,
          bloodPressure: { systolic: 120, diastolic: 80 },
          pulse: 72,
          temperature: 98.6,
          weight: 75,
          passed: true
        },
        isVerified: true
      },
      {
        donor: users[1]._id, // Jane Smith
        bloodRequest: bloodRequests[1]._id,
        donationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        location: {
          name: 'Fortis Hospital Blood Bank',
          address: {
            street: '154/11, Bannerghatta Road',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600007'
          }
        },
        bloodType: 'B+',
        volume: 450,
        status: 'completed',
        healthCheck: {
          hemoglobin: 13.8,
          bloodPressure: { systolic: 115, diastolic: 75 },
          pulse: 68,
          temperature: 98.4,
          weight: 60,
          passed: true
        },
        isVerified: true
      }
    ];

    const donations = await Donation.insertMany(sampleDonations);
    console.log(`💉 Created ${donations.length} sample donations`);

    // Update users with last donation dates
    await User.findByIdAndUpdate(users[0]._id, {
      lastDonationDate: sampleDonations[0].donationDate
    });
    await User.findByIdAndUpdate(users[1]._id, {
      lastDonationDate: sampleDonations[1].donationDate
    });

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin users: 1`);
    console.log(`- Regular users: ${users.length}`);
    console.log(`- Blood requests: ${bloodRequests.length}`);
    console.log(`- Donations: ${donations.length}`);
    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin@bloodlink.com / admin123');
    console.log('User: john@example.com / password123');
    console.log('User: jane@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
