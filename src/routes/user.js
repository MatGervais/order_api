const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')


const {validateToken} = require('../../config/jwt')
const {user} = new PrismaClient()

router.get('/', validateToken, async (req, res)=>{
    const users = await user.findMany({
        select:{
            id:true,
            email:true,
            lastname:true,
            firstname:true,
            isActive:true,
            username:true,
            medications:true
        }
    });

    res.json(users)
})

router.get('/:id', validateToken, async (req, res)=>{
    const idUser = parseInt(req.params.id)

    const userExists = await user.findUnique({
        where:{
            id: idUser
        },
        select:{
            email:true,
            lastname:true,
            firstname:true,
            isActive:true,
            username:true,
            medications:true
        }
    })

    if(!userExists){
        return res.status(400).json({success: false, message:"Cet utilisateur n'existe pas"})
    }

    res.status(200).json({user:userExists})
})

router.put('/:id', validateToken, async (req, res)=>{
    const userId = parseInt(req.params.id)
    const userDatas = req.body

    const userExists = await user.findUnique({
        where:{
            id: userId
        }
    })

    if(!userExists){
         return res.status(400).json({success: false, message:"Cet utilisateur n'existe pas"})
    }
    try{
    const modifyUser = await user.update({
        where:{
            id: userId
        },
        data: userDatas
        
    })
    res.status(200).json({success: true, message:"Informations sauvegardées", modifyUser})
    } catch(err){
        res.status(400).json({success: false, message:"Échec lors de la mise à jour des informations"})
    }
})


module.exports = router