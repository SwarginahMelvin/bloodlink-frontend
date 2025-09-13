const mongoose = require('mongoose');

// Your MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://nehhadharshini:Nehha%401115@bloodlink.mdjjxtd.mongodb.net/?retryWrites=true&w=majority&appName=bloodlink';

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // Test creating a simple document
    const testCollection = mongoose.connection.db.collection('connection_test');
    await testCollection.insertOne({
      message: 'Connection test successful',
      timestamp: new Date()
    });
    
    console.log('✅ Test document created successfully!');
    
    // Clean up test document
    await testCollection.deleteOne({ message: 'Connection test successful' });
    console.log('🧹 Test document cleaned up');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.name === 'MongoServerError') {
      console.log('\n🔍 Common MongoDB Atlas issues:');
      console.log('1. Check if your IP address is whitelisted in MongoDB Atlas');
      console.log('2. Verify your username and password');
      console.log('3. Ensure the database name is correct');
      console.log('4. Check if the cluster is running');
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    process.exit(0);
  }
}

testConnection();
