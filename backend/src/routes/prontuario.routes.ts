import {  Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
    buscarProntuario,
    salvarProntuario,
    adicionarEvolucao,
    adicionarCorrecao,
} from '../controllers/prontuario.controller';

const router = Router({  mergeParams: true });

router.get('/prontuario', authenticate, buscarProntuario);
router.put('/prontuario', authenticate, salvarProntuario);
router.post('/evolucoes', authenticate, adicionarEvolucao);

export default router;