import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import {
    criarPacote,
    listarPacotes,
    adicionarSessao,
    marcarPagamento,
} from '../controllers/pacote.controller'

const router = Router({ mergeParams: true })

router.post('/pacotes', authenticate, criarPacote)
router.get('/pacotes', authenticate, listarPacotes)

export default router