const express = require('express');
const Warga = require('../models/Warga');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// RT/RW: daftarkan warga baru (status otomatis 'pending')
router.post('/', protect, authorize('rtrw'), async (req, res) => {
  try {
    const { nama, usaha, emoji, modalDibutuhkan, foto } = req.body;

    const warga = await Warga.create({
      nama,
      usaha,
      emoji,
      modalDibutuhkan,
      foto,
      rtrw: req.user.id,
    });

    res.status(201).json({ message: 'Warga berhasil didaftarkan', warga });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
});

// SEMUA (yang login): lihat daftar warga yang SUDAH disetujui (untuk donatur pilih & donasi)
router.get('/disetujui', protect, async (req, res) => {
  try {
    const wargaList = await Warga.find({ status: 'disetujui' }).populate('rtrw', 'name');
    res.json(wargaList);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
});

// ADMIN: lihat semua warga yang masih 'pending' (untuk diverifikasi)
router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const wargaList = await Warga.find({ status: 'pending' }).populate('rtrw', 'name');
    res.json(wargaList);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
});

// ADMIN: verifikasi warga (setujui/tolak)
router.patch('/:id/verifikasi', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'disetujui' atau 'ditolak'

    if (!['disetujui', 'ditolak'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const warga = await Warga.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!warga) {
      return res.status(404).json({ message: 'Warga tidak ditemukan' });
    }

    res.json({ message: `Warga berhasil di-${status}`, warga });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
});

// RT/RW: lihat warga yang mereka daftarkan sendiri (untuk dashboard progress)
router.get('/milik-saya', protect, authorize('rtrw'), async (req, res) => {
  try {
    const wargaList = await Warga.find({ rtrw: req.user.id });
    res.json(wargaList);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
});

module.exports = router;