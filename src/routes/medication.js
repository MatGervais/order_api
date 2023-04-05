const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const cron = require('cron')
const moment = require('moment')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const {validateToken} = require('../../config/jwt')
const {medication, user} = new PrismaClient()

    async function updateMedicationStock() {
        const allMeds = await medication.findMany()
        
        for (const medication of allMeds) {
            await prisma.medication.update({
                where: { id: medication.id },
                data: { stock: medication.stock - medication.dosage },
            });
        }
    }
const resourceCheck = new cron.CronJob('0 0 0 */1 * *', async function () {
    updateMedicationStock()
}, null, true, 'Europe/Paris');

// Démarrer la tâche cron
resourceCheck.start();

let depletedOnes = []
let destinataires = []

function removeDuplicates(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
}

async function isMedicationDepleted (req,res){
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

    for(let i=0; i<medications.length; i++){
        const renewed = new Date(medications[i].renewed)
        var nbJourRestant = Math.trunc(medications[i].stock/medications[i].dosage)
        const renew = moment(moment(renewed).add(nbJourRestant, 'days').format("YYYY-MM-DDTHH:mm:ss.SSSSZ"))._i
        const diffTime = Math.abs(new Date(renew) - new Date());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // console.log(medications[i])
        if(diffDays*medications[i].dosage < 26){
            // console.log("-----",moment(new Date(medications[i].renewed).getTime()).format("DD"))
            // console.log(medications[i].name,"+++++++",diffDays,diffDays*medications[i].dosage)
            depletedOnes.push({
                name:medications[i].name,
                stock: diffDays*medications[i].dosage,
                userId:medications[i].userId,
                user:medications[i].user
            })
            // console.log(depletedOnes)
        }
    }
    if(depletedOnes.length > 0){
        
        for(let j =0; j < depletedOnes.length; j++){
            // console.log(depletedOnes[j]);
            destinataires.push(depletedOnes[j].user.email)
        }
    }
    // console.log(depletedOnes.length);
    
    if(depletedOnes.length < 0){
        console.log(depletedOnes.length)
    }
    else {
        console.log(depletedOnes.length)
        console.log(depletedOnes)
        for (let j = 0; j < depletedOnes; j++) {
            const destinataires = []
            destinataires.push(depletedOnes[j].user.email)

            console.log(depletedOnes[j]);
        }

        console.log(removeDuplicates(destinataires))

        // const resourceCheck = new cron.CronJob('* * * * *', function () {
        //         // Préparer l'e-mail
        //         const mailOptions = {
        //             from: {
        //                 email: 'matgervais@yaprescription.com',
        //                 name: "YaPrescription"
        //             },
        //             to: removeDuplicates(destinataires),
        //             subject: 'Rupture de médicament en vue',
        //             text: "Il semblerait qu'un de vos médicament ne soit plsu très loin de la rupture..."
        //         }

        //         // Envoyer l'e-mail
        //         sgMail
        //         .send(mailOptions)
        //         .then(() => {
        //             console.log('Email sent to ' + removeDuplicates(destinataires))
        //         })
        //         .catch((error) => {
        //             console.error(error)
        //         })            
        // }, null, true, 'America/Los_Angeles');

        // // Démarrer la tâche cron
        // resourceCheck.start();
        }
    
}

isMedicationDepleted()

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

    // if(medExists){
    //     return res.status(400).json({
    //         message:"Un médicament a déjà ce nom dans votre ordonnance"
    //     })
    // }

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