const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Falta MONGO_URI en .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, { });
    console.log('MongoDB conectado');
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
