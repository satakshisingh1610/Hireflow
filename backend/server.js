import 'dotenv/config';  // ✅ loads .env automatically

console.log("ENV CHECK 👉", process.env.MONGO_URI);

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 HireFlow API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
});
