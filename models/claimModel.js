const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false, 
});

const createClaimsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS RitClaims (
            id SERIAL PRIMARY KEY,
            orderId INT NOT NULL,
            userId UUID NOT NULL,
            policyId UUID NOT NULL,
            claimDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) NOT NULL,
            reason VARCHAR(255) NULL
        );
    `;
    try {
        await pool.query(query);
        console.log('RitClaims table created successfully or already exists.');
    } catch (error) {
        console.error(`Error creating claims table: ${error.message}`);
    }
};

const addClaim = async (userId, orderId, policyId, status, reason) => {
    const checkQuery = `SELECT * FROM RitClaims WHERE orderId = $1;`;
    const insertQuery = `
        INSERT INTO RitClaims (userId, orderId, policyId, claimDate, status, reason)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5) RETURNING *;
    `;
    try {
        const existingClaim = await pool.query(checkQuery, [orderId]);
        if (existingClaim.rows.length > 0) {
            return { error: "Claim has already been raised by the user" };
        }

        const result = await pool.query(insertQuery, [userId, orderId, policyId, status, reason]);
        return result.rows[0];
    } catch (error) {
        console.error(`Error adding claim: ${error.message}`);
        return { error: error.message };
    }
};

const updateClaimById = async (id, userId, policyId, status, reason) => {
    const query = `
        UPDATE RitClaims
        SET userId = $1, policyId = $2, claimDate = CURRENT_TIMESTAMP, status = $3, reason = $4
        WHERE id = $5 RETURNING *;
    `;
    try {
        const result = await pool.query(query, [userId, policyId, status, reason, id]);
        return result.rows[0];
    } catch (error) {
        console.error(`Error updating claim: ${error.message}`);
    }
};

const deleteClaimById = async (id) => {
    const query = `DELETE FROM RitClaims WHERE id = $1 RETURNING *;`;
    try {
        const result = await pool.query(query, [id]);
        return result.rowCount > 0 ? { message: "Claim deleted successfully." } : { message: "Claim not found." };
    } catch (error) {
        console.error(`Error deleting claim: ${error.message}`);
    }
};

const getClaimById = async (id) => {
    const query = `SELECT * FROM RitClaims WHERE id = $1;`;
    try {
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(`Error fetching claim by ID: ${error.message}`);
    }
};

const getAllClaims = async () => {
    const query = `SELECT * FROM RitClaims;`;
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error(`Error fetching all claims: ${error.message}`);
    }
};

const getClaimsByUserId = async (userId) => {
    const query = `SELECT * FROM RitClaims WHERE userId = $1;`;
    try {
        const result = await pool.query(query, [userId]);
        return result.rows;
    } catch (error) {
        console.error(`Error fetching claims for user: ${error.message}`);
    }
};

const patchClaimStatusById = async (id, status) => {
    const query = `
        UPDATE RitClaims
        SET status = $1, claimDate = CURRENT_TIMESTAMP
        WHERE id = $2 RETURNING *;
    `;
    try {
        const result = await pool.query(query, [status, id]);
        return result.rows[0];
    } catch (error) {
        console.error(`Error updating claim status: ${error.message}`);
    }
};

module.exports = {
    createClaimsTable,
    addClaim,
    updateClaimById,
    deleteClaimById,
    getClaimById,
    getAllClaims,
    getClaimsByUserId,
    patchClaimStatusById
};
