const express = require('express')
const asyncHandler = require('express-async-handler')
const UserModel = require('../models/User')
const { signAccessToken, signRefreshToken, verifyRefreshToken, verifyAccessToken } = require('../helper/accessToken') //use refresh token when access token has expired
const router = express.Router()
const bcryptjs = require('bcryptjs')


router.post('/login', asyncHandler(async (req, res) => {
    console.log("resume api called")

    const {email, password} = req.body

    if(!email){
        res.status(400)
        throw new Error("Please enter all fields")
    }

    const user =  await UserModel.findOne({email})

    if(!user){
        res.status(400)
        throw new Error("User does not exist")
    }

    //check if password is equal to hashed password
    const isMatch = await user.isValidPassword(password)

    if(!isMatch){
        return res.status(400).json({login: false})
        throw new Error("User credentials invalid")
    }
    else{
        //grant access token
        const accessToken = await signAccessToken(user.userId)
        const refreshToken = await signRefreshToken(user.userId)
        
        //send token with the user details if credentials
        res.status(200).json({accessToken, refreshToken, ...user});
    }
}))

//registering a user
router.post('/register', asyncHandler(async (req, res) => {

    UserModel.create(req.body).then(async(user)=>{
        //grant access token
        const accessToken = await signAccessToken(user.userId)
        const refreshToken = await signRefreshToken(user.userId)
                
        //send token with the user details if credentials
        res.status(200).json({accessToken, refreshToken,...user});
    })
}))


//generate a new token after token expires
router.post('/refresh', asyncHandler(async (req, res) => {
    console.log("resume api called")
   
    try{
        const {refreshToken} = req.body
        //send bad request if not refreshToken
        if(!refreshToken){
            throw new Error("Bad request")
        }
        const userId = await verifyRefreshToken(refreshToken)

        //generate new access and refresh token
        const newAccessToken = await signAccessToken(userId)
        const newRefreshToken = await signRefreshToken(userId)

        res.status(200).json({accessToken: newAccessToken, refreshToken: newRefreshToken});


    }catch (error){
        next(error)
    }

    res.status(200).json(user)
}))

//api to reset password user sends email to start password reset
router.post('/reset', asyncHandler(async (req, res) => {
    //res.status(200).json({message: `Update user ${req.params.id}`})

    const {password, email} = req.body

    const user = await UserModel.findOne({email})

    if(!user){
        res.status(400)
        throw new Error('User not found')
    }
    console.log("hashing new password")


    //create salt using bcryptjs
    bcryptjs.genSalt(10, (err, salt)=>{
        bcryptjs.hash(password, salt, (err, hash) =>{
            console.log("hashing new password in DB...", password)
            if(err) throw err
            
            console.log("new hashed password in DB...", hash)
            UserModel.findByIdAndUpdate(user._id, {password: hash}, {upsert: false}).then((user)=>{
                res.status(200).json(user)
            })
        })
    })
    
}))

module.exports  = router;