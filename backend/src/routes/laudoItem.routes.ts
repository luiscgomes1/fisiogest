import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import {
    buscarLaudo,
    editarLaudo,
    gerarPDF,
} from '../controllers/laudo.controller'

const router = Router()

router.get('/:id', authenticate, buscarLaudo)
router.put('/:id', authenticate, editarLaudo)
router.get('/:id/pdf', authenticate, gerarPDF)

export default router