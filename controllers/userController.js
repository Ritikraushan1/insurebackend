const { validateName, validateEmail, validateAge, validateIncome } = require("../middleware/fieldValidate");
const { getUsersWithId, updateUserInTable, deleteUserFromTable } = require("../models/userModel")
const redisClient = require('../config/redisClient')

const getUserDetails = async(req,res, next)=>{
    const user = req.user;
    console.log("user from req", user);
    
    
    try {
        
        const users = await getUsersWithId(user.id);
        if(users){
            console.log("users", users);
            const returnUser ={
                id: users.userId,
                name: users.name,
                email: users.email,
                income: users.income,
                age: users.age,
            }
            return res.status(200).json(returnUser)
        }else{
            return res.status(400).json({message:"User not found"})
        }
    } catch (error) {
        console.log("user not found", error);
        
    }
}

const updateUserDetails = async(req,res)=>{
    const user = req.user;
    const {name, email, income, age} = req.body

    const validName = validateName(name);
    if(!validName){
        return res.status(400).json({error: "Eneterd name is not valid"})
    }

    const validEmail = validateEmail(email)
    if(!validEmail){
        return res.status(400).json({error:"Entered email is not valid"})
    }
    const validAge = validateAge(age)
    if(!validAge){
        return res.status(400).json({error:"Age is not valid"})
    }

    const validIncome = validateIncome(income)
    if(!validIncome){
        return res.status(400).json({error:"Income is not valid"})
    }

    try {
        const users ={
            name,
            email,
            age,
            income
        }
        const response = await updateUserInTable(user.id, users);
        return res.status(200).json({message: "user account updated successfully", user: response})
    } catch (error) {
        console.log("error in updating");
        return res.status(500).json({error:"Error in updating users"})
    }
}


const deleteUserDetails = async(req, res)=>{
    const user = req.user;
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ message: 'Authorization token is missing or invalid' });
    }

    const accessToken = authHeader.split(' ')[1];

    try {
        await deleteUserFromTable(user.id);
        await redisClient.set(accessToken, 'accessToken', 'EX', 24 * 3600,);
        return res.status(200).json({message:"User account deleted successfully"})
        
    } catch (error) {
        return res.status(500).json({error:"Error in deleting user from database"})
    }
}

module.exports = {getUserDetails, updateUserDetails, deleteUserDetails}