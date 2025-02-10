const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false, 
  });

// Create the RitCategory table if it doesn't exist
const createCategoryTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS RitCategory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        logo VARCHAR(255),
        offer VARCHAR(100),
        description TEXT
    );
    `;
    try {
        await pool.query(query);
        console.log('Category table checked/created successfully');
    } catch (error) {
        console.error(`Error in creating category table: ${error}`);
        throw new Error('Failed to create category table');
    }
};

// Add a new category
const addCategory = async (category) => {
    const { name, logo, offer, description } = category;
    const query = `
    INSERT INTO RitCategory (name, logo, offer, description)
    RETURNING *;
    `;
    try {
        const result = await pool.query(query, [name, logo, offer, description]);
        return { success: true, category: result.rows[0] };
    } catch (error) {
        console.error(`Error in adding category: ${error}`);
        return { success: false, error: 'Failed to add category' };
    }
};

// Update an existing category
const updateCategory = async (id, category) => {
    const { name, logo, offer, description } = category;
    const query = `
    UPDATE RitCategory
    SET name = $2, logo = $3, offer = $4, description = $5
    WHERE id = $1
    RETURNING *;
    `;
    try {
        const result = await pool.query(query, [id, name, logo, offer, description]);
        if (result.rows.length > 0) {
            return { success: true, category: result.rows[0] };
        } else {
            return { success: false, error: 'Category not found' };
        }
    } catch (error) {
        console.error(`Error in updating category: ${error}`);
        return { success: false, error: 'Failed to update category' };
    }
};

// Patch an existing category
const patchCategory = async (id, category) => {
    const updates = [];
    const values = [id];
    let index = 2;

    for (const key in category) {
        updates.push(`${key} = $${index}`);
        values.push(category[key]);
        index++;
    }

    if (updates.length === 0) return { success: false, error: 'No fields to update' };
    
    const query = `
    UPDATE RitCategory
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING *;
    `;

    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return { success: true, category: result.rows[0] };
        } else {
            return { success: false, error: 'Category not found' };
        }
    } catch (error) {
        console.error(`Error in patching category: ${error}`);
        return { success: false, error: 'Failed to patch category' };
    }
};

// Delete a category by ID
const deleteCategory = async (id) => {
    const query = `DELETE FROM RitCategory WHERE id = $1 RETURNING *;`;
    try {
        const result = await pool.query(query, [id]);
        if (result.rowCount > 0) {
            return { success: true, message: 'Category deleted successfully' };
        } else {
            return { success: false, error: 'Category not found' };
        }
    } catch (error) {
        console.error(`Error in deleting category: ${error}`);
        return { success: false, error: 'Failed to delete category' };
    }
};

// Get all categories
const getAllCategories = async () => {
    const query = `SELECT * FROM RitCategory;`;
    try {
        const result = await pool.query(query);
        return { success: true, categories: result.rows };
    } catch (error) {
        console.error(`Error in getting all categories: ${error}`);
        return { success: false, error: 'Failed to fetch categories' };
    }
};

// Get a category by ID
const getCategoryById = async (id) => {
    const query = `SELECT * FROM RitCategory WHERE id = $1;`;
    try {
        const result = await pool.query(query, [id]);
        if (result.rows.length > 0) {
            return { success: true, category: result.rows[0] };
        } else {
            return { success: false, error: 'Category not found' };
        }
    } catch (error) {
        console.error(`Error in getting category by ID: ${error}`);
        return { success: false, error: 'Failed to fetch category' };
    }
};

module.exports = {
    createCategoryTable,
    addCategory,
    updateCategory,
    patchCategory,
    deleteCategory,
    getAllCategories,
    getCategoryById,
};
