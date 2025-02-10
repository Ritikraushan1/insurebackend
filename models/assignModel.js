const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false, 
});

// ✅ Create Table If Not Exists
const createAssignPolicyTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS RitAssign (
        id SERIAL PRIMARY KEY,
        userId UUID NOT NULL,
        policyId UUID NOT NULL,
        date TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(query);
    console.log('✅ RitAssign table created or already exists');
  } catch (error) {
    console.error(`❌ Error creating table: ${error}`);
  }
};

// ✅ Add Assignment
const addAssignment = async (userId, policyId) => {
  const query = `
      INSERT INTO RitAssign (userId, policyId, date)
      VALUES ($1, $2, NOW());
  `;
  try {
    await pool.query(query, [userId, policyId]);
    console.log('✅ Assignment added successfully');
  } catch (error) {
    console.error(`❌ Error adding assignment: ${error}`);
  }
};

// ✅ Check If Assignment Exists
const checkAssignmentExists = async (userId, policyId) => {
  const query = `
      SELECT COUNT(*) AS count
      FROM RitAssign
      WHERE userId = $1 AND policyId = $2;
  `;
  try {
    const result = await pool.query(query, [userId, policyId]);
    return parseInt(result.rows[0].count, 10) > 0;
  } catch (error) {
    console.error(`❌ Error checking assignment existence: ${error}`);
    throw error;
  }
};

// ✅ Get Assignment By ID
const getAssignmentById = async (id) => {
  const query = `SELECT * FROM RitAssign WHERE id = $1;`;
  try {
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    console.error(`❌ Error fetching assignment by ID: ${error}`);
  }
};

// ✅ Get Assignments By User ID
const getAssignmentsByUserId = async (userId) => {
  const query = `SELECT * FROM RitAssign WHERE userId = $1;`;
  try {
    const result = await pool.query(query, [userId]);
    console.log('✅ Fetched assignments:', result.rows);
    return result.rows;
  } catch (error) {
    console.error(`❌ Error fetching assignments by userId: ${error}`);
  }
};

// ✅ Get Assignments By Policy ID
const getAssignmentsByPolicyId = async (policyId) => {
  const query = `SELECT * FROM RitAssign WHERE policyId = $1;`;
  try {
    const result = await pool.query(query, [policyId]);
    return result.rows;
  } catch (error) {
    console.error(`❌ Error fetching assignments by policyId: ${error}`);
  }
};

// ✅ Update Assignment By ID
const updateAssignmentById = async (id, userId, policyId) => {
  const query = `
      UPDATE RitAssign
      SET userId = $1, policyId = $2, date = NOW()
      WHERE id = $3;
  `;
  try {
    await pool.query(query, [userId, policyId, id]);
    console.log('✅ Assignment updated successfully');
  } catch (error) {
    console.error(`❌ Error updating assignment: ${error}`);
  }
};

// ✅ Get All Assignments
const getAllAssignments = async () => {
  const query = `SELECT * FROM RitAssign;`;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error(`❌ Error fetching all assignments: ${error}`);
  }
};

// ✅ Delete Assignment By ID
const deleteAssignmentById = async (id) => {
  const query = `DELETE FROM RitAssign WHERE id = $1;`;
  try {
    await pool.query(query, [id]);
    console.log('✅ Assignment deleted successfully');
  } catch (error) {
    console.error(`❌ Error deleting assignment: ${error}`);
  }
};

// ✅ Export Functions
module.exports = {
  createAssignPolicyTable,
  addAssignment,
  getAssignmentById,
  getAssignmentsByUserId,
  getAssignmentsByPolicyId,
  updateAssignmentById,
  getAllAssignments,
  deleteAssignmentById,
  checkAssignmentExists,
};
