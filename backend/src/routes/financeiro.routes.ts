import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import {
    resumoFinanceiro,
    financeiroPorPaciente,
} from '../controllers/financeiro.controller'

const router = Router()

router.get('/', authenticate, resumoFinanceiro)
router.get('/pacientes', authenticate, financeiroPorPaciente)

export default router