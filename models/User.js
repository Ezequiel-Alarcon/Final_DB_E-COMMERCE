const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AddressSchema = new mongoose.Schema({
  label: String,
  street: String,
  city: String,
  zip: String,
  country: String,
  phone: String
}, { _id: false });

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  rol: { type: String, enum: ['user','admin'], default: 'user' },
  direccion: AddressSchema,
  direcciones: [AddressSchema],
  telefono: String,
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidate){
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
