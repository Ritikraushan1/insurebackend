const mysql = require('mssql')

const mySQLConfig = {
    database : process.env.DATABASE_NAME,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    server : process.env.DATABASE_HOST,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      options: {
        encrypt: true, 
        trustServerCertificate: true, 
      },
}

const dbConnection = async () => {
    try {
      await mysql.connect(mySQLConfig);
      console.log('Connected to SQL Server');
    } catch (err) {
      console.error('Error in connecting with database:', err.message);
      process.exit(1); 
    }
  };

module.exports = {
  mysql,
  dbConnection
};
