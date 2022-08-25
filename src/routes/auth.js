const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')

const {user} = new PrismaClient()

const bcrypt = require('bcrypt')
const {createTokens} = require('../../config/jwt')

router.post('/register', async (req, res)=>{
    const {email, password} = req.body

    const userExists = await user.findUnique({
        where:{
            email
        }
    })

    if(userExists) {
        res.status(400).json({success : false, message:"Cette adresse mail est déjà enregistrée"})
    }
    else {
        bcrypt.hash(password, 10).then((hash)=>{
            const newUser = user.create({
                data:{
                    ...req.body,
                    password:hash
                }
            }).then(()=>{
                res.json({newUser,success: true, message:"Vous êtes bien enregistré·e, merci !"})
            }).catch((err)=>{
                if(err) {
                    res.status(400).json({error:err})
                }
            })
        })
    }

})
router.post('/login', async (req, res)=>{
    const {email, password} = req.body

    const userExists = await user.findUnique({
        where:{
            email
        }
    })

    if(!userExists){
        res.status(400).json({message:"User doesn't exists"})
    }

    const dbPassword = userExists.password
    bcrypt.compare(password, dbPassword).then((match)=>{
        if(!match){
            res.status(400).json({message:"Wrong username or password"})
        }
        else {
            const accessToken = createTokens(userExists)

            res.cookie("accessToken", accessToken, {
                maxAge: 60*60*24*30*1000,
                httpOnly:true
            })
            res.json("LOGGED IN")
        }
    });


})

router.get('/logout', (req,res)=>{
    res.cookie('accessToken','',{maxAge:1})
    res.json('logged out')
})

module.exports = router