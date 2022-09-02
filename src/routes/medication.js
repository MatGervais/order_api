const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')


const {validateToken} = require('../../config/jwt')
const {medication, user} = new PrismaClient()

router.get('/', validateToken, async (req, res)=>{
    const medications = await medication.findMany({
        include:{
            user: {
                select:{
                    firstname:true,
                    lastname:true,
                    email:true
                }
            }
        }
    });

    res.json(medications)
})

router.get('/:med_id', validateToken, async(req,res)=>{
    const id = parseInt(req.params.med_id)
    const oneMedication = await medication.findFirst({
        where:{
            id
        }
    })

    if(!oneMedication){
        return res.status(400).json({
            "msg":"Ce médicament n'existe pas dans votre ordonnance"
        })
    }

    res.status(200).json({
        oneMedication,
        "msg":"Médicament trouvé"
    })
})

router.get('/user/:user_id', validateToken, async(req,res)=>{
    const userId = parseInt(req.params.user_id)
    console.log("Récupération des medicaments du user : "+ userId +"...");


    const userExists = await user.findUnique({
        where:{
            id: userId
        }
    })

    if(!userExists){
         return res.status(400).json({success: false, message:"Cet utilisateur n'existe pas"})
    }

    const userMeds = await medication.findMany({
        where:{
            userId
        }
    })

    if(userMeds.length < 1){
        return res.status(400).send({
            message:"Vous n'avez pas de médicament enregistré"
        })
    }

    res.json({medications: userMeds})
    
})

router.post('/', validateToken, async(req,res)=>{
    const PostMedication = req.body
    console.log("Création d'un nouveau médicament pour le user : " + PostMedication.userId);

    const medExists = await medication.findFirst({
        where : {
            name: PostMedication.name
        },
        select:{
            name:true
        }
    })

    if(medExists){
        return res.status(400).send({
            "msg":"Ce médicament apparait déjà dans votre ordonnance"
        })
    }
    if(PostMedication.userId == null){
        return res.status(400).send({
            "msg":"Aucun user n'est renseigné !"
        })
    }

    const newMedication = await medication.create({
        data : {
            ...PostMedication,
            dosage: parseInt(PostMedication.dosage),
            stock: parseInt(PostMedication.stock),
            renewed : new Date(PostMedication.renewed),
            userId : PostMedication.userId
        }
    })

    res.json({
        newMedication,
        "msg":"Nouveau médicament ajouté"
    })
})


router.delete('/:med_id', validateToken, async(req,res)=>{
    const id = parseInt(req.params.med_id)
    const deleteMed = await medication.delete({
        where:{
            id
        }
    })

    res.json({deleteMed,"msg":"Élement supprimé"})
})

router.put("/:med_id",validateToken, async(req,res)=>{
    const id= parseInt(req.params.med_id)
    const form = req.body


    const medExists = await medication.findUnique({
        where : {
            name: form.name
        },
        select:{
            name:true
        }
    })

    if(medExists){
        return res.status(400).json({
            message:"Un médicament a déjà ce nom dans votre ordonnance"
        })
    }

    const modifyMed = await medication.update({
        where:{
            id:id
        },
        data:{
            ...form,
            renewed: new Date(form.renewed),
            dosage: parseInt(form.dosage),
            stock:parseInt(form.stock)
        }
    })

    res.json({
        modifyMed,
        "msg":"Modification effectuée avec succès"
    })

})





module.exports = router