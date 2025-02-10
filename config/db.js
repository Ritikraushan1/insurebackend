const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for some cloud-hosted PostgreSQL services like Heroku
  },
});

const dbConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    client.release(); // Release the connection back to the pool
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err.message);
    process.exit(1);
  }
};

module.exports = {
  pool,
  dbConnection,
};
