import { Request, Response } from "express";
import prisma from "../lib/prisma";
import {
  criarPacoteComSessoes,
  adicionarSessaoAoPacote,
  LIMITE_SESSOES,
} from "../services/pacote.service";

export async function criarPacote(req: Request, res: Response) {
  const { id: paciente_id } = req.params;
  const { tipo, valor_cobrado, status_pagamento, sessoes } = req.body;

  if (!tipo || valor_cobrado === undefined) {
    return res
      .status(400)
      .json({ erro: "Tipo do pacote e valor cobrado são obrigatórios." });
  }

  if (!["INDIVIDUAL", "PACOTE_5", "PACOTE_10"].includes(tipo)) {
    return res
      .status(400)
      .json({
        erro: "Tipo de pacote inválido. Opções: INDIVIDUAL, PACOTE COM 5, PACOTE COM 10.",
      });
  }

  const paciente = await prisma.paciente.findFirst({
    where: { id: paciente_id, profissional_id: req.profissionalId },
  });

  if (!paciente) {
    return res.status(404).json({ erro: "Paciente não encontrado." });
  }

  try {
    const resultado = await criarPacoteComSessoes({
      paciente_id,
      profissional_id: req.profissionalId!,
      tipo,
      valor_cobrado,
      status_pagamento,
      sessoes: sessoes || [],
    });

    return res.status(201).json(resultado);
  } catch (erro: any) {
    return res.status(400).json({ erro: erro.message });
  }
}

export async function listarPacotes(req: Request, res: Response) {
  const { id: paciente_id } = req.params;

  const paciente = await prisma.paciente.findFirst({
    where: { id: paciente_id, profissional_id: req.profissionalId },
  });

  if (!paciente) {
    return res.status(404).json({ erro: "Paciente não encontrado." });
  }

  const pacotes = await prisma.pacote.findMany({
    where: { paciente_id, profissional_id: req.profissionalId },
    include: {
      sessoes: {
        include: {
          agendamento: {
            select: {
              id: true,
              data: true,
              horario: true,
              slot: true,
              status: true,
              tipo: true,
            },
          },
        },
      },
    },
    orderBy: { criado_em: "desc" },
  });

  const pacotesComContador = pacotes.map((pacote) => {
    const sessoesRealizadas = pacote.sessoes.filter(
      (s) => s.agendamento.status === "COMPARECEU",
    ).length;

    const limite = LIMITE_SESSOES[pacote.tipo as keyof typeof LIMITE_SESSOES];

    return {
      ...pacote,
      sessoes_realizadas: sessoesRealizadas,
      sessoes_agendadas: pacote.sessoes.length,
      sessoes_limite: limite,
    };
  });

  return res.json(pacotesComContador);
}

export async function adicionarSessao(req: Request, res: Response) {
  const { id: pacote_id } = req.params;
  const { data, horario, slot, tipo } = req.body;

  if (!data || !horario || !slot) {
    return res
      .status(400)
      .json({
        erro: "Data, horário e slot são obrigatórios para adicionar uma sessão.",
      });
  }

  const pacote = await prisma.pacote.findFirst({
    where: { id: pacote_id, profissional_id: req.profissionalId },
  });

  if (!pacote) {
    return res.status(404).json({ erro: "Pacote não encontrado." });
  }

  try {
    const resultado = await adicionarSessaoAoPacote({
      pacote_id,
      profissional_id: req.profissionalId!,
      paciente_id: pacote.paciente_id,
      sessao: { data, horario, slot, tipo },
    });

    return res.status(201).json(resultado);
  } catch (erro: any) {
    return res.status(400).json({ erro: erro.message });
  }
}

export async function marcarPagamento(req: Request, res: Response) {
  const { id } = req.params;
  const { status_pagamento } = req.body;

  if (!["AGUARDANDO", "PAGO"].includes(status_pagamento)) {
    return res
      .status(400)
      .json({
        erro: "Status de pagamento inválido. Opções: AGUARDANDO, PAGO.",
      });
  }

  const pacote = await prisma.pacote.findFirst({
    where: { id, profissional_id: req.profissionalId },
  });

  if (!pacote) {
    return res.status(404).json({ erro: "Pacote não encontrado." });
  }

  const pacoteAtualizado = await prisma.pacote.update({
    where: { id },
    data: {
      status_pagamento,
      pago_em: status_pagamento === "PAGO" ? new Date() : null,
    },
  });

  return res.json(pacoteAtualizado);
}
