let cachedDb = null;

async function connectToDatabase() {
  const { MongoClient } = require('mongodb');
  if (cachedDb) return cachedDb;

  // Use DATABASE_URL from environment variables
  const uri = process.env.MONGODB_URI;
  if (!uri) {
      console.error("MONGODB_URI is not defined!");
      return null;
  }

  try {
      const parsed = new URL(uri);
      const attemptUser = parsed.username;
      const attemptPassLength = parsed.password ? parsed.password.length : 0;
      
      const client = await MongoClient.connect(uri);
      let dbName = "zypherrise";
      try {
          dbName = (parsed.pathname && parsed.pathname.length > 1) 
                   ? parsed.pathname.substr(1) 
                   : "zypherrise";
      } catch (e) {
          console.warn("Could not parse DB name from URI");
      }
      const db = client.db(dbName);
      cachedDb = db;
      return db;
  } catch (err) {
      let debugInfo = "Bilinmiyor";
      try {
        const p = new URL(uri);
        debugInfo = `(Kullanıcı: ${p.username}, Şifre Uzunluğu: ${p.password ? p.password.length : 0})`;
      } catch(e) {}
      
      console.error("MongoDB Connection Error:", err.message);
      throw new Error(`MongoDB Hatası: ${err.message} ${debugInfo}`);
  }
}

module.exports = { connectToDatabase };
