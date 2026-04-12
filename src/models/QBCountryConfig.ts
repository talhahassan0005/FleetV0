import mongoose from 'mongoose';

const QBCountryConfigSchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  currency: { type: String, required: true },
  flag: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.QBCountryConfig || 
  mongoose.model('QBCountryConfig', QBCountryConfigSchema);
