const mongoose = require("mongoose")
mongoose.set('debug', true);
const bcryptjs = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    
    userId: String,

    fname: String,

    lname: String,

    gender: String,

    phone: String,

    email: String,

    password: String,

    town: String,

    state: String,

    country: String,

    profileUri: String, //store cloud file path

    emailVerified: Boolean,

    reminderEnabled: Boolean,

    newsEnabled: Boolean,

    updatesEnabled: Boolean,

    policyAgreed: Date,

    termsAgreed: Date,

    dataRequestTime: Date, //As part of Privacy policy user has the right to request of the data saved about them

    disableAccount: Boolean,

    disableDate: Date, //As part of Prvicay Policy users has the right to delete their account

    disableReason: String,

    friends: [mongoose.Schema.Types.Mixed],  //contains objects of {userId, fname, lname, profileUri, messages:[]}

    posts: [mongoose.Schema.Types.Mixed], //contains objects of {postId,post_date,likes, dislikes, videoUri,content, comments:[ {userId, comment,likes, dislikes,reply: [userId, reply, likes, dislikes,reply_date] } ] }
    
})


//For every creation of a user it first hashes their password
UserSchema.pre('save', async function(next) {
    try{
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(this.password, salt)
        this.password = hashedPassword
        next()
    }catch (error){
        next(error)
    }
})

//To check user entered password with their stored hashed password
UserSchema.methods.isValidPassword = async function (password){
    try{
        return await bcryptjs.compare(password, this.password)
    }catch(error){
        throw error
    }
}



const UserModel = mongoose.model("users", UserSchema)
module.exports = UserModel;