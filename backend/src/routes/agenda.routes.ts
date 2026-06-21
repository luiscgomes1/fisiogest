import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
    atualizarStatusAgendamento,
    buscarAgendaDia,
    criarAgendamento,
} from '../controllers/agenda.controller';

const router = Router();

router.get('/', authenticate, buscarAgendaDia);
router.post('/agendamentos', authenticate, criarAgendamento);
router.patch('/agendamentos/:id/status', authenticate, atualizarStatusAgendamento);

export default router;