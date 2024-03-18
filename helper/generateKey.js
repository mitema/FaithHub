const crypto = require('crypto')

//generate secrets: one for access and refresh tokens 
const getSecret = () =>  crypto.randomBytes(32).toString('hex')


module.exports = {
    getSecret
}
