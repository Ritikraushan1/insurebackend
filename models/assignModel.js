const sql = require('mssql')

const createAssignPolicyTable = async ()=> {
    const query = `
    IF NOT EXISTS (
    SELECT * 
    FROM sysobjects 
    WHERE name = 'RitAssign' AND xtype = 'U'
)
BEGIN
    CREATE TABLE RitAssign (
        id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
        userId UNIQUEIDENTIFIER NOT NULL,
        policyId UNIQUEIDENTIFIER NOT NULL,
        date DATETIME NOT NULL DEFAULT GETDATE()
    );
END;
`;
    try {
        await sql.query(query)
    } catch (error) {
        console.log(`Error in creating assign policy table, ${error}`);
    }
}

const addAssignment = async (userId, policyId) => {
    const query = `
        INSERT INTO RitAssign (userId, policyId, date)
        VALUES (@userId, @policyId, GETDATE());
    `;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('policyId', sql.UniqueIdentifier, policyId)
            .query(query);
        console.log('Assignment added successfully');
    } catch (error) {
        console.log(`Error adding assignment: ${error}`);
    }
};
const checkAssignmentExists = async (userId, policyId) => {
    const query = `
        SELECT COUNT(*) AS count
        FROM RitAssign
        WHERE userId = @userId AND policyId = @policyId;
    `;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('policyId', sql.UniqueIdentifier, policyId)
            .query(query);
        return result.recordset[0].count > 0; // Return true if count > 0, false otherwise
    } catch (error) {
        console.log(`Error checking assignment existence: ${error}`);
        throw error; // Propagate error to handle it in the calling function
    }
};


const getAssignmentById = async (id) => {
    const query = `
        SELECT * FROM RitAssign WHERE id = @id;
    `;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(query);
        return result.recordset;
    } catch (error) {
        console.log(`Error fetching assignment by ID: ${error}`);
    }
};

const getAssignmentsByUserId = async (userId) => {
    const query = `
        SELECT * FROM RitAssign WHERE userId = @userId;
    `;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);
        console.log("fetched assignments", result.recordset);
        
        return result.recordset;
    } catch (error) {
        console.log(`Error fetching assignments by userId: ${error}`);
    }
};

const getAssignmentsByPolicyId = async (policyId) => {
    const query = `
        SELECT * FROM RitAssign WHERE policyId = @policyId;
    `;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('policyId', sql.UniqueIdentifier, policyId)
            .query(query);
        return result.recordset;
    } catch (error) {
        console.log(`Error fetching assignments by policyId: ${error}`);
    }
};

const updateAssignmentById = async (id, userId, policyId) => {
    const query = `
        UPDATE RitAssign
        SET userId = @userId, policyId = @policyId, date = GETDATE()
        WHERE id = @id;
    `;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.UniqueIdentifier, userId)
            .input('policyId', sql.UniqueIdentifier, policyId)
            .query(query);
        console.log('Assignment updated successfully');
    } catch (error) {
        console.log(`Error updating assignment: ${error}`);
    }
};

const getAllAssignments = async () => {
    const query = `
        SELECT * FROM RitAssign;
    `;
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(query);
        return result.recordset;
    } catch (error) {
        console.log(`Error fetching all assignments: ${error}`);
    }
};

const deleteAssignmentById = async (id) => {
    const query = `
        DELETE FROM RitAssign WHERE id = @id;
    `;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .query(query);
        console.log('Assignment deleted successfully');
    } catch (error) {
        console.log(`Error deleting assignment: ${error}`);
    }
};

module.exports = {
    createAssignPolicyTable,
    addAssignment,
    getAssignmentById,
    getAssignmentsByUserId,
    getAssignmentsByPolicyId,
    updateAssignmentById,
    getAllAssignments,
    deleteAssignmentById,
    checkAssignmentExists
};