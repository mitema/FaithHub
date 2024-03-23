const express = require('express')
const asyncHandler = require('express-async-handler')
const UserModel = require('../models/User')
const router = express.Router()
const bcryptjs = require('bcryptjs')
const crypto = require('crypto')
const { getSecret } = require('../helper/generateKey')
const { signAccessToken, verifyAccessToken, signRefreshToken } = require('../helper/accessToken')

const ejs = require('ejs')


//check header of requests


router.get('/', verifyAccessToken, asyncHandler(async (req, res) => {

    const { aud } = req.payload

    const user = await UserModel.find({userId: aud})

    if(!user){
        res.status(400)
        throw new Error('User not found')
    }

    //generate accessToken with ttl for user
    const accessToken = await signAccessToken(user.userId)
    console.log("access token generated", accessToken)


    res.status(200).json({...user, accessToken})
}))



//update user (general api to update any field of the user)
router.post('/update', verifyAccessToken, asyncHandler(async (req, res) => { 

    const user = await UserModel.findOne({userId: req.payload.aud})

    if(!user){
        res.status(400)
        throw new Error('User not found')
    }

    const updatedRider  = await UserModel.findByIdAndUpdate(user._id, req.body, {new: false})

    res.status(200).json()
}))


//delete user
router.delete('/', verifyAccessToken, asyncHandler(async (req, res) => {
    const userId = req.payload.aud
    const user = await UserModel.find({userId})

    if(!user){
        res.status(400)
        throw new Error('User not found')
    }
    
    await UserModel.deleteOne({userId})

    res.status(200).send("User deleted")
}))

module.exports  = router;