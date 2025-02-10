const sql = require('mssql')

const createUsersTable = async () => {
    const query = `
    IF NOT EXISTS (
    SELECT * 
    FROM sysobjects 
    WHERE name = 'RitUsers' AND xtype = 'U'
)
BEGIN
    CREATE TABLE RitUsers (
        id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
        userId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(255) UNIQUE NOT NULL,
        income DECIMAL(18, 2) NULL,
        age INT NULL,
        role NVARCHAR(100) NOT NULL,
        password NVARCHAR(255) NOT NULL
    );
END;
`;
    try {
        await sql.query(query)
    } catch (error) {
        console.log(`Error in creating users table, ${error}`);
    }
}

const insertUserIntoTable = async (user) => {
    console.log("user in insertion", user);

    const { name, age, email, password, income, role } = user;

    const query = `
    INSERT INTO RitUsers (name, email, age, income, password, role)
    VALUES (@name, @email, @age, @income, @password, @role);
    `;

    try {
        const request = new sql.Request();

        // Using .input() to pass parameters securely
        request.input('name', sql.NVarChar, name);
        request.input('email', sql.NVarChar, email);
        request.input('age', sql.Int, age);
        request.input('income', sql.Decimal, income);
        request.input('password', sql.NVarChar, password);
        request.input('role', sql.NVarChar, role);

        // Execute the query
        const result = await request.query(query);
        console.log("result after insertion", result);


        const newUser = await findUserByEmail(email);

        console.log("User Insertion successful", newUser);
        return newUser;
    } catch (error) {
        console.log("Error in inserting users data:", error);
        return { error: "User Insertion Failed" };
    }
};



const getAllUsers = async () => {
    const query = `SELECT * FROM RitUsers`;
    try {

        const result = await sql.query(query);
        return result;
    } catch (error) {
        console.log("error in getting users from table");
    }
}

const getUsersWithId = async (userId) => {
    const query = `SELECT * FROM RitUsers WHERE userId = @userId;`; // Use parameterized query

    try {
        const request = new sql.Request();
        request.input('userId', sql.UniqueIdentifier, userId); // Bind the userId parameter

        const result = await request.query(query);
        if (result.recordset && result.recordset.length > 0) {
            console.log("User found:", result.recordset[0]);
            return result.recordset[0]; // Return the first row (expected single user)
        } else {
            console.log("No user found with the given userId.");
            return null; // Return null if no user is found
        } // Assuming you want to return the results
    } catch (error) {
        console.error("Error in getting user from table:", error.message);
        return null;  // Return null in case of error
    }
};


const updateUserInTable = async (userId, updates) => {
    const { name, age, email, password, income, role } = updates;

    const query = `
        UPDATE RitUsers
        SET 
            name = '${name}',
            age = ${age},
            email = '${email}',
            password = '${password}',
            income = ${income},
            role = ${role}
        WHERE userId = '${userId}';
    `;

    try {
        await sql.query(query);
        console.log("User update successful");
    } catch (error) {
        console.error("Error in updating user data:", error.message);
    }
};

const updateUserPassword = async (userId, newPassword) => {
    const query = `
        UPDATE RitUsers
        SET 
            password = '${newPassword}'
        WHERE userId = '${userId}';
    `;

    try {
        await sql.query(query);
        console.log("Password update successful");
        return true;
    } catch (error) {
        console.error("Error in updating user password:", error.message);
        return false;
    }
};


const deleteUserFromTable = async (userId) => {
    const query = `
        DELETE FROM RitUsers
        WHERE userId = '${userId}';
    `;

    try {
        const pool = await sql.connect();
        await sql.query(query);
        console.log(`User with userId ${userId} deleted successfully`);
    } catch (error) {
        console.error("Error in deleting user from table:", error.message);
    }
};

const findUserByEmail = async (email) => {
    const query = `
        SELECT * 
        FROM RitUsers
        WHERE email = '${email}';
    `;

    try {
        const result = await sql.query(query);

        if (result.recordset.length > 0) {
            console.log("User found:", result.recordset[0]);
            return result.recordset[0];
        } else {
            console.log("No user found with the given email.");
            return null;
        }
    } catch (error) {
        console.error("Error in finding user by email:", error.message);
    }
};




module.exports = { createUsersTable, insertUserIntoTable, getAllUsers, getUsersWithId, updateUserInTable, updateUserPassword, deleteUserFromTable, findUserByEmail }