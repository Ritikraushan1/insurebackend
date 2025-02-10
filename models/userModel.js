require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false, 
});

// Create the RitUsers table if it doesn't exist
const createUsersTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS RitUsers (
        id SERIAL PRIMARY KEY,
        userId UUID NOT NULL DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        income DECIMAL(18, 2) NULL,
        age INT NULL,
        role VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL
    );
    `;
    try {
        await pool.query(query);
        console.log('RitUsers table created successfully or already exists.');
    } catch (error) {
        console.error(`Error in creating users table, ${error.message}`);
    }
};

// Insert a user into the table
const insertUserIntoTable = async (user) => {
    const { name, age, email, password, income, role } = user;

    const query = `
        INSERT INTO RitUsers (name, email, age, income, password, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [name, email, age, income, password, role]);
        const newUser = result.rows[0];
        console.log("User Insertion successful", newUser);
        return newUser;
    } catch (error) {
        console.log("Error in inserting users data:", error);
        return { error: "User Insertion Failed" };
    }
};

// Get all users
const getAllUsers = async () => {
    const query = `SELECT * FROM RitUsers`;
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error("Error in getting users from table", error.message);
        return [];
    }
};

// Get user by userId
const getUsersWithId = async (userId) => {
    const query = `SELECT * FROM RitUsers WHERE userId = $1;`;
    try {
        const result = await pool.query(query, [userId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error in getting user from table:", error.message);
        return null;
    }
};

// Update user in the table
const updateUserInTable = async (userId, updates) => {
    const { name, age, email, password, income, role } = updates;

    const query = `
        UPDATE RitUsers
        SET 
            name = $1,
            age = $2,
            email = $3,
            password = $4,
            income = $5,
            role = $6
        WHERE userId = $7
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [name, age, email, password, income, role, userId]);
        console.log("User update successful");
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error in updating user data:", error.message);
        return null;
    }
};

// Update user password
const updateUserPassword = async (userId, newPassword) => {
    const query = `
        UPDATE RitUsers
        SET password = $1
        WHERE userId = $2
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [newPassword, userId]);
        console.log("Password update successful");
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error in updating user password:", error.message);
        return null;
    }
};

// Delete user from the table
const deleteUserFromTable = async (userId) => {
    const query = `DELETE FROM RitUsers WHERE userId = $1 RETURNING *;`;
    try {
        const result = await pool.query(query, [userId]);
        console.log(`User with userId ${userId} deleted successfully`);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error in deleting user from table:", error.message);
        return null;
    }
};

// Find user by email
const findUserByEmail = async (email) => {
    const query = `SELECT * FROM RitUsers WHERE email = $1;`;
    try {
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error in finding user by email:", error.message);
        return null;
    }
};

module.exports = {
    createUsersTable,
    insertUserIntoTable,
    getAllUsers,
    getUsersWithId,
    updateUserInTable,
    updateUserPassword,
    deleteUserFromTable,
    findUserByEmail
};
