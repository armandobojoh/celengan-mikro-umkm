const mongoose = require('mongoose');

const donasiSchema = new mongoose.Schema({
  donatur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  warga: { type: mongoose.Schema.Types.ObjectId, ref: 'Warga', required: true },
  nominal: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Donasi', donasiSchema);