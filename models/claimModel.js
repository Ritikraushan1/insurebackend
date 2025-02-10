const sql = require('mssql')

const createClaimsTable = async () => {
    const query = `
        IF NOT EXISTS (
        SELECT * 
        FROM sysobjects 
        WHERE name = 'RitClaims' AND xtype = 'U'
    )
    BEGIN
        CREATE TABLE RitClaims (
            id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
            orderId INT NOT NULL,
            userId UNIQUEIDENTIFIER NOT NULL,
            policyId UNIQUEIDENTIFIER NOT NULL,
            claimDate DATETIME NOT NULL DEFAULT GETDATE(),
            status NVARCHAR(50) NOT NULL, -- Example: 'Pending', 'Approved', 'Rejected'
            reason NVARCHAR(255) NULL    -- Reason for the claim or its status
        );
    END;
    `;
    try {
        await sql.query(query);
        console.log('RitClaims table created successfully or already exists.');
    } catch (error) {
        console.log(`Error in creating claims table: ${error}`);
    }
};


const addClaim = async (userId, orderId, policyId, status, reason) => {
    const checkQuery = `
        SELECT * FROM RitClaims WHERE orderId = @orderId;
    `;
    const insertQuery = `
        INSERT INTO RitClaims (userId, orderId, policyId, claimDate, status, reason)
        VALUES (@userId, @orderId, @policyId, GETDATE(), @status, @reason);
    `;
    try {
        const pool = await sql.connect();
        
        // Check for existing orderId
        const existingClaim = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(checkQuery);

        if (existingClaim.recordset.length > 0) {
            return {error: "Claims has already been raised by the user"}
        }

        // Insert new claim
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('orderId', sql.Int, orderId)
            .input('policyId', sql.UniqueIdentifier, policyId)
            .input('status', sql.NVarChar(50), status)
            .input('reason', sql.NVarChar(255), reason)
            .query(insertQuery);
        
        console.log('Claim added successfully');
        return result;
    } catch (error) {
        console.error(`Error adding claim: ${error.message}`);
        return { error: error.message };
    }
};


const updateClaimById = async (id, userId, policyId, status, reason) => {
    const query = `
        UPDATE RitClaims
        SET userId = @userId, policyId = @policyId, claimDate = GETDATE(),
            status = @status, reason = @reason
        WHERE id = @id;
    `;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.UniqueIdentifier, userId)
            .input('policyId', sql.UniqueIdentifier, policyId)
            .input('status', sql.NVarChar(50), status)
            .input('reason', sql.NVarChar(255), reason)
            .query(query);
        console.log('Claim updated successfully');
    } catch (error) {
        console.log(`Error updating claim: ${error}`);
    }
};

const deleteClaimById = async (id) => {
    const query = `
        DELETE FROM RitClaims WHERE id = @id;
    `;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .query(query);
        console.log('Claim deleted successfully');
    } catch (error) {
        console.log(`Error deleting claim: ${error}`);
    }
};

const getClaimById = async (id) => {
    const query = `
        SELECT * FROM RitClaims WHERE id = @id;
    `;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(query);
        return result.recordset;
    } catch (error) {
        console.log(`Error fetching claim by ID: ${error}`);
    }
};

const getAllClaims = async () => {
    const query = `
        SELECT * FROM RitClaims;
    `;
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(query);
        return result.recordset;
    } catch (error) {
        console.log(`Error fetching all claims: ${error}`);
    }
};

const getClaimsByUserId = async (userId) => {
    const query = `
        SELECT * FROM RitClaims WHERE userId = @userId;
    `;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);
        console.log("result for user claims ", result);
        
        return result.recordset;
    } catch (error) {
        console.log(`Error fetching claims for user: ${error}`);
    }
};

const patchClaimStatusById = async (id, status) => {
    const query = `
        UPDATE RitClaims
        SET status = @status, claimDate = GETDATE()
        WHERE id = @id;
    `;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar(50), status)
            .query(query);
        console.log('Claim status updated successfully');
        return result
    } catch (error) {
        console.log(`Error updating claim status: ${error}`);
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
