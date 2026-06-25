import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import {
    criarLaudo,
    listarLaudos,
} from '../controllers/laudo.controller'

const router = Router({ mergeParams: true })

router.post('/laudos', authenticate, criarLaudo)
router.get('/laudos', authenticate, listarLaudos)

export default router