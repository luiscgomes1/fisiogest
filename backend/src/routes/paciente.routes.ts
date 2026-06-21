import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  listarPacientes,
  buscarPaciente,
  criarPaciente,
  atualizarPaciente,
  desativarPaciente,
  reativarPaciente,
  corrigirIdentidade,
} from "../controllers/paciente.controller";

const router = Router();

router.get("/", authenticate, listarPacientes);
router.get("/:id", authenticate, buscarPaciente);
router.post("/", authenticate, criarPaciente);
router.put("/:id", authenticate, atualizarPaciente);
router.delete("/:id", authenticate, desativarPaciente);
router.patch("/:id/reativar", authenticate, reativarPaciente);
router.patch("/:id/identidade", authenticate, corrigirIdentidade);

export default router;