const { connectToDatabase } = require('./db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Tüm alanları doldurun!' });
    }

    const db = await connectToDatabase();
    const users = db.collection('users');

    // Check existing
    const existing = await users.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Bu kullanıcı adı veya e-posta zaten kullanımda!' });
    }

    const newUser = {
      username,
      email,
      password, // In production, hash this!
      isFounder: true,
      createdAt: new Date()
    };

    await users.insertOne(newUser);
    res.json({ success: true, message: 'Kayıt başarılı! Kurucu Pelerinine hak kazandınız.', user: { username, isFounder: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
};
