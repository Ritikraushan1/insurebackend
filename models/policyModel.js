const sql = require('mssql');

const createPolicyTable = async () => {
    const query = `
    IF NOT EXISTS (
        SELECT * 
        FROM sysobjects 
        WHERE name = 'RitPolicy' AND xtype = 'U'
    )
    BEGIN
        CREATE TABLE RitPolicy (
            id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
            policyId NVARCHAR(50) NOT NULL UNIQUE,
            policyName NVARCHAR(100) NOT NULL,
            premiumAmount NVARCHAR(255) NOT NULL,
            duration DECIMAL(18, 2) NULL,
            description NVARCHAR(255) NULL,
            category NVARCHAR(255) NOT NULL,
            coverage NVARCHAR(MAX) NULL,
            validAge NVARCHAR(50) NULL,
            additionalinformation NVARCHAR(255),
            isActive BIT NOT NULL DEFAULT 1
        );
    END;
    `;
    try {
        await sql.query(query);
    } catch (error) {
        console.log(`Error in creating policy table, ${error}`);
    }
};

const generatePolicyId = async () => {
    const query = `SELECT COUNT(*) AS count FROM RitPolicy`;
    try {
        const request = new sql.Request();
        const result = await request.query(query);
        const count = result.recordset[0].count + 1;
        return `POL${count.toString().padStart(3, '0')}`;
    } catch (error) {
        console.log("Error generating policy ID:", error);
    }
};

const insertNewPolicy = async (policy) => {
    console.log("Adding policy with data", policy);
    const policyId = await generatePolicyId();
    const query = `
        INSERT INTO RitPolicy(policyId, policyName, premiumAmount, duration, description, category, coverage, validAge, isActive)
        VALUES (@policyId, @policyName, @premiumAmount, @duration, @description, @category, @coverage, @validAge, @isActive);
        SELECT * FROM RitPolicy WHERE policyId = @policyId;
    `;

    try {
        const request = new sql.Request();
        request.input('policyId', sql.NVarChar, policyId);
        request.input('policyName', sql.NVarChar, policy.policyName);
        request.input('premiumAmount', sql.NVarChar, policy.premiumAmount);
        request.input('duration', sql.Decimal, policy.duration);
        request.input('description', sql.NVarChar, policy.description);
        request.input('category', sql.NVarChar, policy.category);
        request.input('coverage', sql.NVarChar, policy.coverage);
        request.input('validAge', sql.NVarChar, policy.validAge);
        request.input('isActive', sql.Bit, policy.isActive ?? 1);

        const result = await request.query(query);
        console.log("Result after insertion", result.recordset[0]);
        return result.recordset[0];
    } catch (error) {
        console.log("Error in inserting policy:", error);
    }
};

const updatePolicyIsActive = async (policyId, isActive) => {
    const query = `
        UPDATE RitPolicy
        SET isActive = @isActive
        WHERE policyId = @policyId;
        SELECT * FROM RitPolicy WHERE policyId = @policyId;
    `;
    try {
        const request = new sql.Request();
        request.input('policyId', sql.NVarChar, policyId);
        request.input('isActive', sql.Bit, isActive);

        const result = await request.query(query);
        console.log("Policy isActive updated:", result.recordset);
        return result.recordset[0];
    } catch (error) {
        console.log("Error in updating policy isActive:", error);
    }
};

const updatePolicyWithId = async (policyId, updatedPolicy) => {
    const query = `
        UPDATE RitPolicy
        SET 
            policyName = @policyName,
            premiumAmount = @premiumAmount,
            duration = @duration,
            description = @description,
            category = @category,
            coverage = @coverage,
            validAge = @validAge,
            isActive = @isActive
        WHERE policyId = @policyId;
        SELECT * FROM RitPolicy WHERE policyId = @policyId;
    `;

    try {
        const request = new sql.Request();
        request.input('policyId', sql.NVarChar, policyId);
        request.input('policyName', sql.NVarChar, updatedPolicy.policyName);
        request.input('premiumAmount', sql.Float, updatedPolicy.premiumAmount);
        request.input('duration', sql.Int, updatedPolicy.duration);
        request.input('description', sql.NVarChar, updatedPolicy.description);
        request.input('category', sql.NVarChar, updatedPolicy.category);
        request.input('coverage', sql.NVarChar, updatedPolicy.coverage);
        request.input('validAge', sql.NVarChar, updatedPolicy.validAge);
        request.input('isActive', sql.Bit, updatedPolicy.isActive);

        const result = await request.query(query);
        console.log("Policy updated:", result.recordset[0]);
        return result.recordset[0];
    } catch (error) {
        console.log("Error in updating policy:", error);
        throw error;
    }
};


const getAllPolicies = async () => {
    const query = `
        SELECT * FROM RitPolicy;
    `;
    try {
        const request = new sql.Request();
        const result = await request.query(query);

        return result.recordset;
    } catch (error) {
        console.log("Error in fetching all policies:", error);
        throw error;
    }
};

const getActivePolicies = async () => {
    const query = `
        SELECT * FROM RitPolicy WHERE isActive = 1;
    `;
    try {
        const request = new sql.Request();
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.log("Error in fetching active policies:", error);
    }
};

const getPolicyById = async (policyId) => {
    const query = `
        SELECT * FROM RitPolicy WHERE policyId = @policyId;
    `;
    try {
        const request = new sql.Request();
        request.input('policyId', sql.NVarChar, policyId);
        const result = await request.query(query);
        return result.recordset[0] || null;
    } catch (error) {
        console.log("Error in fetching policy by ID:", error);
    }
};

const deletePolicyWithId = async (policyId) => {
    const query = `
        DELETE FROM RitPolicy
        WHERE policyId = @policyId;
    `;
    try {
        const request = new sql.Request();
        request.input('policyId', sql.NVarChar, policyId);

        const result = await request.query(query);
        if (result.rowsAffected > 0) {
            console.log("Policy deleted successfully.");
            return { message: 'Policy deleted successfully.' };
        } else {
            console.log("Policy not found.");
            return { message: 'Policy not found.' };
        }
    } catch (error) {
        console.log("Error in deleting policy:", error);
    }
};

module.exports = { createPolicyTable, insertNewPolicy, getPolicyById, updatePolicyWithId, getAllPolicies, getActivePolicies, updatePolicyIsActive, deletePolicyWithId };
