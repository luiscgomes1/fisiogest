import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { adicionarCorrecao } from '../controllers/prontuario.controller';

const router = Router();

router.patch('/:id/correcao', authenticate, adicionarCorrecao);

export default router;