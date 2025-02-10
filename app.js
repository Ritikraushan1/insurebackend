const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { dbConnection } = require('./config/db.js')
const authRoute = require('./route/authRoute.js');
const userRoute = require('./route/userRoute.js');
const policyRoute = require('./route/policyRoute.js');
const claimRoute = require('./route/claimRoute.js')
const assignPolicyRoute = require('./route/assignRoute.js')
const categoryRoute = require('./route/categoryRoute.js')
const { createUsersTable } = require('./models/userModel.js');
const { createPolicyTable } = require('./models/policyModel.js');
const { createAssignPolicyTable } = require('./models/assignModel.js');
const { createClaimsTable } = require('./models/claimModel.js');
const { createCategoryTable } = require('./models/categoryModel.js');
const logger = require('./middleware/logger.js')
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}))
app.use(express.json())
app.use(cookieParser())

const checkDBConnection = async () => {
    try {
        await dbConnection();
        await createUsersTable();
        await createPolicyTable();
        await createAssignPolicyTable();
        await createClaimsTable();
        await createCategoryTable();
        console.log("database connected successful");

    } catch (error) {
        console.log("error in connecting database", error?.message);

    }
}

checkDBConnection()

app.use(logger)

app.use('/auth', authRoute)
app.use('/user', userRoute)
app.use('/policy', policyRoute)
app.use('/claim', claimRoute)
app.use('/assign-policy', assignPolicyRoute)
app.use('/category', categoryRoute)


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})