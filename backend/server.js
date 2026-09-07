const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // Tambahkan path
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Melayani file frontend statis (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, './'))); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB terhubung!'))
  .catch((err) => console.error('Gagal konek MongoDB:', err));

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const wargaRoutes = require('./routes/wargaRoutes');
app.use('/warga', wargaRoutes);

const donasiRoutes = require('./routes/donasiRoutes');
app.use('/donasi', donasiRoutes);

// Fallback route untuk mengarahkan ke index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
