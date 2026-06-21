import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
	buscarPerfil,
	atualizarPerfil,
	trocarSenha,
} from '../controllers/profissional.controller';

const router = Router();

router.get('/me', authenticate, buscarPerfil);
router.put('/me', authenticate, atualizarPerfil);
router.put('/me/senha', authenticate, trocarSenha);

export default router;