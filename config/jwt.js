const {sign, verify} = require('jsonwebtoken')

const createTokens = (user) =>{
    const accessToken = sign(
        { email: user.email, id: user.id, firstname: user.firstname, lastname: user.lastname, status: user.isActive, username: user.username },
        process.env.ACCESS_TOKEN_SECRET,{ expiresIn: "30d"}
    )

    return accessToken;
}

const validateToken = (req, res, next) =>{
    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]

    if(!token)
        return res.status(401).json({message:"Utilisateur non connecté"})
    
    try {
        verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
            if(err){
                return res.status(401).send({message:err})
            }
            req.user = user;
            next()
        })
    } catch (error) {
        return res.status(400).json({message : error})
    }

}

module.exports = {createTokens, validateToken}