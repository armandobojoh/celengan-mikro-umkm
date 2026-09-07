const express = require('express');
const Donasi = require('../models/Donasi');
const Warga = require('../models/Warga');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// DONATUR: buat donasi baru
router.post('/', protect, authorize('donatur'), async (req, res) => {
  try {
    const { wargaId, nominal } = req.body;

    const warga = await Warga.findById(wargaId);
    if (!warga) {
      return res.status(404).json({ message: 'Warga tidak ditemukan' });
    }
    if (warga.status !== 'disetujui') {
      return res.status(400).json({ message: 'Warga ini belum disetujui untuk menerima donasi' });
    }

    const donasi = await Donasi.create({
      donatur: req.user.id,
      warga: wargaId,
      nominal,
    });

    // tambahkan nominal donasi ke total terkumpul milik warga
    warga.terkumpul += nominal;
    await warga.save();

    res.status(201).json({ message: 'Donasi berhasil', donasi });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
});

// DONATUR: lihat riwayat donasi milik sendiri
router.get('/milik-saya', protect, authorize('donatur'), async (req, res) => {
  try {
    const donasiList = await Donasi.find({ donatur: req.user.id })
      .populate('warga', 'nama usaha emoji');
    res.json(donasiList);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
});

// ADMIN: lihat semua history donasi dari semua donatur
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const donasiList = await Donasi.find()
      .populate('donatur', 'name email')
      .populate('warga', 'nama usaha');
    res.json(donasiList);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
});

module.exports = router;