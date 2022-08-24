const {sign, verify} = require('jsonwebtoken')

const createTokens = (user) =>{
    const accessToken = sign(
        { email: user.email, id: user.id, firstname: user.firstname, lastname: user.lastname },
        process.env.ACCESS_TOKEN_SECRET
    )

    return accessToken;
}

const validateToken = (req, res, next) =>{
    const accessToken = req.cookies["accessToken"]

    if(!accessToken)
        return res.status(400).json({message:"User not authenticated"})
    
    try {
        const validToken = verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        if(validToken) {
            req.authenticated = true
            return next()
        }
    } catch (error) {
        return res.status(400).json({message : error})
    }

}

module.exports = {createTokens, validateToken}