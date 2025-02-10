const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { insertUserIntoTable, findUserByEmail, updateUserPassword } = require('../models/userModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const redisClient = require('../config/redisClient')


const signupUser = async (req, res) => {
    console.log("route reaching here signup");

    const { name, email, income, password, age, role } = req.body;
    console.log(req.body);

    const isExistingUser = await findUserByEmail(email);
    console.log(isExistingUser);

    if (isExistingUser) {
        return res.status(400).json({ error: "user already exists" })
    }


    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = {
        name: name,
        email: email,
        income: income,
        password: hashedPassword,
        age: age,
        role
    }

    try {
        const addUsers = await insertUserIntoTable(user);
        if (addUsers && addUsers.error) {
            return res.status(400).json({ error: addUsers.error });
        }
        const returnUser = {
            id: addUsers.userId,
            email: addUsers.email,
            name: addUsers.name,
            income: addUsers.income,
            age: addUsers.age,
            role: addUsers.role
        }
        const token = jwt.sign(returnUser, process.env.JWT_SECRET, {
            expiresIn: '1d'
        })
        const result = {
            user: returnUser,
            token
        }
        return res.status(201).json(result)
    } catch (error) {
        return res.status(400).json({ error: "Error in signup with users" })
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {

        const isExistingUser = await findUserByEmail(email);
        console.log();
        console.log(isExistingUser);


        if (!isExistingUser) {
            return res.status(400).json({ error: "User Not Found" })
        }
        const passwordMatch = await bcrypt.compare(password, isExistingUser.password);

        if (!passwordMatch) {
            return res.status(400).json({ error: "Incorrect password" });
        }

        const returnUser = {
            id: isExistingUser.userId,
            name: isExistingUser.name,
            email: isExistingUser.email,
            income: isExistingUser.income,
            age: isExistingUser.age,
            role: isExistingUser.role
        }
        const token = jwt.sign(returnUser, process.env.JWT_SECRET, {
            expiresIn: '1d'
        })
        res.cookie('token', token, {
            httpOnly: true, // Prevent JavaScript access
            maxAge: 24 * 60 * 60 * 1000, // Set secure to true in production
            sameSite: 'strict', // Prevent CSRF attacks
        });
        return res.status(200).json({
            message: "Login successful",
            token,
            user: returnUser,
        });
    } catch (error) {
        console.log(`error in logging in ${error}`);

    }
}
const generateOtp = () => Math.floor(100000 + Math.random() * 900000);
const generateTransactionId = () => crypto.randomUUID();

const sendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }
    const isExistingUser = await findUserByEmail(email);


    if (!isExistingUser) {
        return res.status(400).json({ error: "User Not Found with this email" })
    }
    const otp = generateOtp();
    const transactionId = generateTransactionId();
    try {
        await redisClient.set(otp, otp, 'EX', 120,);

        return res.status(200).json({
            message: 'OTP sent successfully.',
            otp,
        });
    } catch (error) {
        console.error('Error in sending OTP:', error);
        return res.status(500).json({ error: 'Failed to send OTP. Please try again later.' });
    }
}

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and otp is required.' });
    }
    const isExistingUser = await findUserByEmail(email);

    if (!isExistingUser) {
        return res.status(400).json({ error: "User Not Found with this email" })
    }
    try {
        const response = await redisClient.get(otp);
        console.log("response from redis", response);

        if (otp === response) {
            return res.status(200).json({ message: 'OTP Verified Successfully' })
        } else {
            return res.status(400).json({ message: 'Wrong Otp Entered' })
        }
    } catch (error) {
        console.log("error in verifying otp", error.message);
        return res.status(400).json({ message: 'Error in verifying otp. Try again after sometime' })
    }
}

const forgotPassword = async (req, res) => {
    const { email, password } = req.body;
    try {
        const isExistingUser = await findUserByEmail(email);
        console.log();
        console.log(isExistingUser);


        if (!isExistingUser) {
            return res.status(400).json({ error: "User Not Found" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const updated = await updateUserPassword(isExistingUser.userId, hashedPassword)

        if (updated) {
            return res.status(200).json({ message: "Password updated successfully!" });
        } else {
            return res.status(500).json({ error: "Failed to update password" });
        }
    } catch (error) {
        console.error("Error in forgotPassword:", error.message);
        return res.status(500).json({ error: "Something went wrong" });
    }
}

const logoutUser = async (req, res) => {
    const token = req.cookies.token;


    try {
        await redisClient.set(token, 'accessToken', 'EX', 24 * 3600,);

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (err) {
        console.error('Error storing token in Redis:', err);
        res.status(500).json({ message: 'Server error during logout' });
    }
};



module.exports = { signupUser, loginUser, logoutUser, forgotPassword, sendOtp, verifyOtp }