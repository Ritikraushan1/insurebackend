require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false, 
});

// Create the RitPolicy table if it doesn't exist
const createPolicyTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS RitPolicy (
        id SERIAL PRIMARY KEY,
        policyId VARCHAR(50) NOT NULL UNIQUE,
        policyName VARCHAR(100) NOT NULL,
        premiumAmount VARCHAR(255) NOT NULL,
        duration DECIMAL(18, 2) NULL,
        description VARCHAR(255) NULL,
        category VARCHAR(255) NOT NULL,
        coverage TEXT NULL,
        validAge VARCHAR(50) NULL,
        additionalInformation VARCHAR(255),
        isActive BOOLEAN NOT NULL DEFAULT TRUE
    );`;

    try {
        await pool.query(query);
        console.log('RitPolicy table created successfully or already exists.');
    } catch (error) {
        console.error(`Error creating policy table: ${error.message}`);
    }
};

// Generate a unique policy ID
const generatePolicyId = async () => {
    const query = `SELECT COUNT(*) AS count FROM RitPolicy;`;
    try {
        const result = await pool.query(query);
        const count = parseInt(result.rows[0].count) + 1;
        return `POL${count.toString().padStart(3, '0')}`;
    } catch (error) {
        console.error("Error generating policy ID:", error);
    }
};

// Insert a new policy
const insertNewPolicy = async (policy) => {
    const policyId = await generatePolicyId();
    const query = `
        INSERT INTO RitPolicy (policyId, policyName, premiumAmount, duration, description, category, coverage, validAge, additionalInformation, isActive)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
    `;
    try {
        const result = await pool.query(query, [
            policyId,
            policy.policyName,
            policy.premiumAmount,
            policy.duration,
            policy.description,
            policy.category,
            policy.coverage,
            policy.validAge,
            policy.additionalInformation,
            policy.isActive ?? true
        ]);
        return result.rows[0];
    } catch (error) {
        console.error("Error inserting policy:", error);
    }
};

// Update isActive status for a policy
const updatePolicyIsActive = async (policyId, isActive) => {
    const query = `
        UPDATE RitPolicy
        SET isActive = $1
        WHERE policyId = $2
        RETURNING *;
    `;
    try {
        const result = await pool.query(query, [isActive, policyId]);
        return result.rows[0] || { error: "Policy not found" };
    } catch (error) {
        console.error("Error updating policy isActive:", error);
    }
};

// Update policy details
const updatePolicyWithId = async (policyId, updatedPolicy) => {
    const query = `
        UPDATE RitPolicy
        SET 
            policyName = $1,
            premiumAmount = $2,
            duration = $3,
            description = $4,
            category = $5,
            coverage = $6,
            validAge = $7,
            additionalInformation = $8,
            isActive = $9
        WHERE policyId = $10
        RETURNING *;
    `;
    try {
        const result = await pool.query(query, [
            updatedPolicy.policyName,
            updatedPolicy.premiumAmount,
            updatedPolicy.duration,
            updatedPolicy.description,
            updatedPolicy.category,
            updatedPolicy.coverage,
            updatedPolicy.validAge,
            updatedPolicy.additionalInformation,
            updatedPolicy.isActive,
            policyId
        ]);
        return result.rows[0] || { error: "Policy not found" };
    } catch (error) {
        console.error("Error updating policy:", error);
    }
};

// Fetch all policies
const getAllPolicies = async () => {
    const query = `SELECT * FROM RitPolicy;`;
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error("Error fetching all policies:", error);
    }
};

// Fetch active policies
const getActivePolicies = async () => {
    const query = `SELECT * FROM RitPolicy WHERE isActive = TRUE;`;
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error("Error fetching active policies:", error);
    }
};

// Fetch policy by ID
const getPolicyById = async (policyId) => {
    const query = `SELECT * FROM RitPolicy WHERE policyId = $1;`;
    try {
        const result = await pool.query(query, [policyId]);
        return result.rows[0] || { error: "Policy not found" };
    } catch (error) {
        console.error("Error fetching policy by ID:", error);
    }
};

// Delete policy by ID
const deletePolicyWithId = async (policyId) => {
    const query = `DELETE FROM RitPolicy WHERE policyId = $1 RETURNING *;`;
    try {
        const result = await pool.query(query, [policyId]);
        return result.rows[0] || { error: "Policy not found" };
    } catch (error) {
        console.error("Error deleting policy:", error);
    }
};

module.exports = {
    createPolicyTable,
    insertNewPolicy,
    getPolicyById,
    updatePolicyWithId,
    getAllPolicies,
    getActivePolicies,
    updatePolicyIsActive,
    deletePolicyWithId
};
