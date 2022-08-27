const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')

const {user} = new PrismaClient()

const bcrypt = require('bcrypt')
const {createTokens} = require('../../config/jwt')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

function fieldsEmpty(fields) {
    var valid = 0;
    fields.map((field)=>{
        if(field.length > 0){
            valid = valid + 1;
        }
    })
    if(valid < fields.length){
        return false
    }
    return true
}

// router.get('/users', async(req,res)=>{
//     const nbUser = await user.count()

//     res.json({nbUsers:nbUser})
// })

function isEmail(email) {
    var emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (email.match(emailFormat)) { return true; }
    
    return false;
}

router.post('/register', async (req, res)=>{
    
    // const msg = {
    //   to: 'matgervais@hotmail.fr', // Change to your recipient
    //   from: 'matgervais96@gmail.com', // Change to your verified sender
    //   subject: 'Confirmation de pré-inscription',
    //   text: 'and easy to do anywhere, even with Node.js',
    //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    // }
    
    // sgMail
    //   .send(msg)
    //   .then(() => {
    //     console.log('Email sent')
    //   })
    //   .catch((error) => {
    //     console.error(error)
    //   })
    const nbUser = await user.count()
    const {firstname, lastname, email, password} = req.body

    const REGEX = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,}$/
    if(nbUser > 49){
        res.json({success : false, message:"La limite d'inscription a été atteinte, suivez moi sur instagram (lordironblade) pour rester au courant."})
    }
    else if((!fieldsEmpty([firstname,lastname,email,password]))){

        res.json({success : false, message:"Merci de renseigner tous les champs du formulaire !"})

    }
    else if(!isEmail(email)){
        res.json({success : false, message: "L'adresse mail renseignée n'est pas valide !"})
    }
    else if(!(password.match(REGEX))){

        res.json({success : false, message:"Le mot de passe doit contenir au moins 8 caractères, 1 MAJUSCULE, 1 minuscule, 1 chiffre et un caractère spécial, tout ça SANS espace !"})

    }
    else {

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
                        lastname,
                        firstname,
                        email,
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