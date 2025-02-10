const sql = require('mssql');

// Create the RitCategory table if it doesn't exist
const createCategoryTable = async () => {
    const query = `
    IF NOT EXISTS (
        SELECT * 
        FROM sysobjects 
        WHERE name = 'RitCategory' AND xtype = 'U'
    )
    BEGIN
        CREATE TABLE RitCategory (
            id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
            name NVARCHAR(100) NOT NULL,
            logo NVARCHAR(255),
            offer NVARCHAR(100),
            description TEXT
        );
    END;
    `;
    try {
        await sql.query(query);
        console.log('Category table checked/created successfully');
    } catch (error) {
        console.error(`Error in creating category table: ${error}`);
        throw new Error('Failed to create category table');
    }
};

// Add a new category
const addCategory = async (category) => {
    const { name, logo, offer, description } = category;
    console.log("description in model", description);


    const query = `
    INSERT INTO RitCategory (name, logo, offer, description)
    OUTPUT INSERTED.*
    VALUES (@name, @logo, @offer, @description);
    `;

    try {
        // Create a new SQL request
        const request = new sql.Request();

        // Add parameters to the request
        request.input('name', sql.NVarChar, name);
        request.input('logo', sql.NVarChar(sql.MAX), logo);  // Allow large logo URL
        request.input('offer', sql.NVarChar, offer);
        request.input('description', sql.NText, description);  // Allow large text for description

        // Execute the query
        const result = await request.query(query);

        // Return the inserted category
        return { success: true, category: result.recordset[0] };
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
    SET name = @name, logo = @logo, offer = @offer, description = @description
    OUTPUT INSERTED.*
    WHERE id = @id;
    `;
    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        request.input('name', sql.NVarChar, name);
        request.input('logo', sql.NVarChar(sql.MAX), logo);  // Allow large logo URL
        request.input('offer', sql.NVarChar, offer);
        request.input('description', sql.NText, description);  // Allow large text for description

        const result = await request.query(query);

        if (result.recordset.length > 0) {
            return { success: true, category: result.recordset[0] };
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
    const { name, logo, offer, description } = category;
    const query = `
    UPDATE RitCategory
    SET 
        name = COALESCE(@name, name),
        logo = COALESCE(@logo, logo),
        offer = COALESCE(@offer, offer),
        description = COALESCE(@description, description)
    OUTPUT INSERTED.*
    WHERE id = @id;
    `;

    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        request.input('name', sql.NVarChar, name || null);
        request.input('logo', sql.NVarChar(sql.MAX), logo || null);  // Allow large logo URL
        request.input('offer', sql.NVarChar, offer || null);
        request.input('description', sql.NText, description || null);  // Allow large text for description

        const result = await request.query(query);

        if (result.recordset.length > 0) {
            return { success: true, category: result.recordset[0] };
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
    const query = `
    DELETE FROM RitCategory
    WHERE id = @id;
    `;
    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);

        const result = await request.query(query);

        if (result.rowsAffected[0] > 0) {
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
    const query = `
    SELECT * FROM RitCategory;
    `;
    try {
        const result = await sql.query(query);
        return { success: true, categories: result.recordset };
    } catch (error) {
        console.error(`Error in getting all categories: ${error}`);
        return { success: false, error: 'Failed to fetch categories' };
    }
};

// Get a category by ID
const getCategoryById = async (id) => {
    const query = `
    SELECT * FROM RitCategory
    WHERE id = @id;
    `;
    try {
        const result = await sql.query(query, [
            { name: 'id', type: sql.Int, value: id },
        ]);
        if (result.recordset.length > 0) {
            return { success: true, category: result.recordset[0] };
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
