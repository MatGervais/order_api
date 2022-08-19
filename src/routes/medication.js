const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')


const {medication} = new PrismaClient()

router.get('/', async (req, res)=>{
    const medications = await medication.findMany();

    res.json(medications)
})

router.get('/:med_id', async(req,res)=>{
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

router.post('/', async(req,res)=>{
    const PostMedication = req.body

    const medExists = await medication.findUnique({
        where : {
            name: PostMedication.name
        },
        select:{
            name:true
        }
    })

    if(medExists){
        return res.status(400).json({
            "msg":"Ce médicament apparait déjà dans votre ordonnance"
        })
    }

    const newMedication = await medication.create({
        data : {
            ...PostMedication,
            renewed : new Date(PostMedication.renewed)
        }
    })

    res.json({
        newMedication,
        "msg":"Nouveau médicament ajouté"
    })
})


router.delete('/:med_id', async(req,res)=>{
    // console.log(req.params);
    const id = parseInt(req.params.med_id)
    const deleteMed = await medication.delete({
        where:{
            id
        }
    })

    res.json({deleteMed,"msg":"Élement supprimé"})
})

router.put("/:med_id", async(req,res)=>{
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
            "msg":"Un médicament a déjà ce nom dans votre ordonnance"
        })
    }

    const modifyMed = await medication.update({
        where:{
            id:id
        },
        data:{
            ...form,
            renewed: new Date(form.renewed)
        }
    })

    res.json({
        modifyMed,
        "msg":"Modification effectuée avec succès"
    })

})





module.exports = router