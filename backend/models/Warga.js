const mongoose = require('mongoose');

const wargaSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  usaha: { type: String, required: true },
  emoji: { type: String, default: '🏪' },
  modalDibutuhkan: { type: Number, required: true },
  terkumpul: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'disetujui', 'ditolak'], default: 'pending' },
  rtrw: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foto: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Warga', wargaSchema);