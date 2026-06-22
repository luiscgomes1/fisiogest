import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import {
  adicionarSessao,
  marcarPagamento,
} from '../controllers/pacote.controller'

const router = Router()

router.post('/:id/sessoes', authenticate, adicionarSessao)
router.patch('/:id/pagamento', authenticate, marcarPagamento)

export default router