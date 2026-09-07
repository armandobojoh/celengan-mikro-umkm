const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB terhubung!'))
  .catch((err) => console.error('Gagal konek MongoDB:', err));
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);
const wargaRoutes = require('./routes/wargaRoutes');
app.use('/warga', wargaRoutes);
const donasiRoutes = require('./routes/donasiRoutes');
app.use('/donasi', donasiRoutes);
app.get('/', (req, res) => {
  res.send('Backend jalan!');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});