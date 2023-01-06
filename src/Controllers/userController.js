// POST /login
// Allow an user to login with their email and password.
// On a successful login attempt return a JWT token contatining the userId, exp, iat. The response should be a JSON object like this
// If the credentials are incorrect return a suitable error message with a valid HTTP status code. The response should be a JSON object like this
// Books API


const userModel = require('../Models/userModel')
const jwt = require('jsonwebtoken')

const isValidName = function (name) {
    const nameRegex = /^[a-zA-Z ]{2,30}$/
    return nameRegex.test(name)
}

const isEmail = (email) => {
    regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
    return regex.test(email)
}

const isPassword = function (password) {
    regex = /^[a-zA-Z0-9!@#$%^&*]{8,15}$/
    return regex.test(password)
}

const isMobile = function (phone) {
    regex = /^\d{10}$/
    return regex.test(phone)
}

const isValid = function (value) {
    if (typeof (value) !== "string" || value.trim().length == 0) {
        return false
    } return true
}



const createuser = async function (req, res) {

    try {

        let data = req.body
        let { title, name, phone, email, password, address } = data;

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: 'Please Enter Details' })
        }

        if (!title) {
            return res.status(400).send({ status: false, message: "Please Enter Title" })
        }

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Please Enter Valid Title" })
        }

        let Title = ["Mr", "Miss", "Mrs"]
        if (!Title.includes(title)) {
            return res.status(400).send({ status: false, message: 'Please Enter Valid Title =>["Mr", "Miss", "Mrs"]' })
        }
       




        if (!name) {
            return res.status(400).send({ status: false, message: "Please Enter Name" })
        }

        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: 'Name Must Be String And Cannot Be Empty' })
        }
        
        if (!isValidName(name)) {
            return res.status(400).send({ status: false, message: 'Please Enter Valid Name' })
        }
        name = name.trim().toLowerCase()

        if (!phone) {
            return res.status(400).send({ status: false, message: 'Please enter Mobile number' })
        }
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: 'Please Enter Valid Phone Number' })
        }
        
        if (!isMobile(phone)) {
            return res.status(400).send({ status: false, message: 'Please Enter Valid Phone Number' })
        }
        
        


        let isUniquephone = await userModel.findOne({ phone: phone })
        if (isUniquephone) { return res.status(400).send({ status: false, message: 'Phone number already exist' }) }

        if (!email) {
            return res.status(400).send({ status: false, message: 'Please Enter EmailID' })
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'Please Enter VAlid Email ID' })
        }

        if (!isEmail(email)) {
            return res.status(400).send({ status: false, message: 'please enter valid email address' })
        }
        email = email.trim().toLowerCase()


        let isUniqueemail = await userModel.findOne({ email: email })
        if (isUniqueemail) {
            return res.status(400).send({ status: false, message: 'Email Id already exist' })
        }
        if (!password) {
            return res.status(400).send({ status: false, message: 'Please enter  password' })
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'please enter valid password' })
        }

        if (!isPassword(password)) {
            return res.status(400).send({ status: false, message: 'please enter valid password' })
        }


        if (address) {
            if(typeof address != "object"){
            return res.status(400).send({status:false,msg:"Please Enter Valid Address"})
            }
            if (Object.keys(address).length == 0) {
                return res.status(400).send({ status: false, msg: "please enter address Details" })
            }
            if (address.street) {
                
                if (!isValid(address.street)) {
                    return res.status(400).send({ status: false, msg: "please provide vaild street" })
                }
                address.street = address.street.trim().toLowerCase()
            }
            if (address.city) {
                if (!isValid(address.city)) {
                    return res.status(400).send({ status: false, msg: "please provide vaild city" })
                }
                address.city = address.city.trim().toLowerCase()
            }
            if (address.pincode) {
                if (!isValid(address.pincode)) {
                    return res.status(400).send({ status: false, msg: "please provide vaild pincode" })
                    }
                }
            }

        let obj = { title, name, email, address, password, phone }
        //validation end
        const newUser = await userModel.create(obj);
        return res.status(201).send({ status: true, message: 'User successfully created', data: newUser })
    }

    catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message })
    }
}



const userLogin = async (req, res) => {

    try {
        let body = req.body
        let { email, password } = body

        if (Object.keys(body).length == 0) {
            return res.status(400).send({ status: false, msg: "please enter detail " })
        }

        if (!email) {
            return res.status(400).send({ status: false, msg: "Please Enter Email_ID " })
        }
        if (!isEmail(email)) {
            return res.status(400).send({ status: false, msg: "Please Enter Valid Email_ID" })
        }

        let emailExist = await userModel.findOne({ email: email })

        if (!emailExist) {
            return res.status(400).send({ status: false, msg: "You Are Not Registered, Please Try Again" })
        }




        if (!password) {
            return res.status(400).send({ status: false, msg: "Please Enter Password" })
        }
        if (!isPassword(password)) {
            return res.status(400).send({ status: false, msg: "Please Enter Valid Password" })
        }

        let passwordCheck = await userModel.findOne({ email: email, password: password })
        if (!passwordCheck) {
            return res.status(400).send({ status: false, msg: "Wrong password, Please Try Again" })
        }



        let userId = passwordCheck._id
        
        let token = jwt.sign({
            userId: userId._id
        }, "this is secret key", { expiresIn: '1500000' })


        res.setHeader("x-api-token", token)
        res.status(200).send({ status: false, message: "Success", Data: token })

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}






module.exports.createuser = createuser
module.exports.userLogin = userLogin 