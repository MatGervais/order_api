const { PrismaClient } = require('@prisma/client')
import { Request, Response } from 'express';
const prisma = new PrismaClient();
const {medication} = new PrismaClient();

    export class MedicationController {

        public async getAll(req: Request, res: Response) {
            const medications = await medication.findMany();

            res.json(medications)
        }

    // async getAll(req, res){
    //     const medications = await medication.findMany();

    //     res.json(medications)
    // }

    // async getOne(req, res){
    //     const id = parseInt(req.params.med_id)
    //     const oneMedication = await medication.findFirst({
    //         where: {
    //             id
    //         }
    //     })

    //     if (!oneMedication) {
    //         return res.status(400).json({
    //             "msg": "Ce médicament n'existe pas dans votre ordonnance"
    //         })
    //     }

    //     res.status(200).json({
    //         oneMedication,
    //         "msg": "Médicament trouvé"
    //     })
    //     }
}