const validateEmail = async (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return false;
    } else {
        return true;
    }
}

const validateName = async (name) => {
    const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
    if (!nameRegex.test(name)) {
        return false;
    } else {
        return true;
    }
}

const validateIncome = (income) => {
    if (isNaN(income) || income <= 0) {
        return false;
    }
    return true;
};

const validateAge = (age) => {
    if (isNaN(age) || age <= 0 || !Number.isInteger(age)) {
        return false;
    }
    return true;
};

const validatePassword = (password)=>{
    if(password.length<8){
        return false;
    }
    return true;
}

module.exports = {validateName, validateEmail, validateIncome, validateAge, validatePassword }