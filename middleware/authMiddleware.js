const { validateName, validateEmail, validateAge, validateIncome, validatePassword } = require("./fieldValidate");

const validateSignUpDetails =async(req, res, next)=>{
    const {name, email, age, income, password} = req.body;

    if(!name || !email || !age || !income || !password){
        return res.status(400).json({error:"Name, Email, Age, Income & Passwords are required"})
    }
    const validName = await validateName(name);
    if(!validName){
        return res.status(400).json({error:"Name is not valid as it should not contain any numbers"})
    }
    const validEmail = await validateEmail(email);
    if(!validEmail){
        return res.status(400).json({error:"Entered Email is not valid"})
    }
    const validAge = await validateAge(age);
    if(!validAge){
        return res.status(400).json({error:"Entered age is invalid"})
    }
    const validIncome = await validateIncome(income);
    if(!validIncome){
        return res.status(400).json({error: "Entered income is not valid"})
    }
    const validPassword = await validatePassword(password);
    if(!validPassword){
        return res.status(400).json({error:"Invalid Password. Password must be of minimum 8 characters"})
    }

    next()
}

const validateLoginDetails = async(req, res, next)=>{
    const {email,password} = req.body;

    const validEmail = await validateEmail(email);
    if(!validEmail){
        return res.status(400).json({error:"Entered Email is not valid"})
    }

    const validPassword = await validatePassword(password);
    if(!validPassword){
        return res.status(400).json({error:"Invalid Password. Password must be of minimum 8 characters"})
    }

    next()
}

const validateForgotPassword = async(req, res, next)=>{
    const {email} = req.body;
    const validEmail = await validateEmail(email);
    console.log(validEmail);
    
    // if(!validEmail){
    //     return res.status(400).json({error:"Entered Email is not valid"})
    // }
    next()

}

module.exports = {validateSignUpDetails, validateLoginDetails, validateForgotPassword}