const { connectToDatabase } = require('./db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gereklidir!' });
    }

    const db = await connectToDatabase();
    if (!db) {
        return res.status(500).json({ success: false, message: 'Veritabanı bağlantısı yapılamadı! (Lütfen MONGODB_URI ayarını Vercel\'den yapın)' });
    }
    const users = db.collection('users');

    const user = await users.findOne({ username, password });
    if (user) {
      res.json({ success: true, user: { username: user.username, isFounder: user.isFounder } });
    } else {
      res.status(401).json({ success: false, message: 'Hatalı kullanıcı adı veya şifre!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
};
