const JWT = require('jsonwebtoken')

const signAccessToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {
        }
        const secret = process.env.ACCESS_TOKEN_SECRET
        const options = {
            expiresIn: '4h', //24h
            audience: userId //(who is the token is for)
        }
        JWT.sign(payload, secret, options, (error, token) =>{
            if(error) return reject(error.message) //internal server error status:500
            resolve(token)
        })
    })
}

const verifyAccessToken = (req, res, next) => {
    if(!req.headers['authorization']) return next("Unauthorized access") //{error:{status:401, message:"Unauthorized"}}
    const authHeader = req.headers['authorization']
    const bearerToken = authHeader.split(' ')
    const token = bearerToken[1]
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {

        if(err){
            //if access token is expired
            if(err.name === 'JsonWebTokenError'){
                return next("Unauthorized access") 
            }
            else{
                return next(err.message) //jwt expired
            }
         
        } 
        console.log("payload in verify token", payload)
        req.payload = payload
        console.log("request payload in verify token", req.payload)
        next()
    })
}

const signRefreshToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {
            //aud:userId
        }
        const secret = process.env.REFRESH_TOKEN_SECRET
        const options = {
            expiresIn: '1y', //make refresh token longer if user access app in a year ask user to log back in to application
            audience: userId //(who the token is for)
        }
        JWT.sign(payload, secret, options, (error, token) =>{
            if(error) return reject(error.message)
            resolve(token)
        })
    })
}

const verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
            if(err) return next("Unauthorized access") 

            //extract user id from the payload
            const userId = payload.aud

            resolve(userId)

               
        })
    })
    
}

const getTokenPayload = (accessToken) => {
    return new Promise((resolve, reject) => {
        JWT.decode(accessToken, (err, payload) => {
            const userId = payload.aud

            resolve(userId)
        })
       
    })
    
}




module.exports = {
    signAccessToken,
    verifyAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    getTokenPayload
}