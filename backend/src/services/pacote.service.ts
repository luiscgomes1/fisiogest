import prisma from "../lib/prisma";

export const LIMITE_SESSOES = {
  INDIVIDUAL: 1,
  PACOTE_5: 5,
  PACOTE_10: 10,
} as const;

type TipoPacote = keyof typeof LIMITE_SESSOES;

interface SessaoInput {
  data: string;
  horario: string;
  slot: number;
  tipo?: string;
}

interface CriarPacoteInput {
  paciente_id: string;
  profissional_id: string;
  tipo: TipoPacote;
  valor_cobrado: number;
  status_pagamento?: "AGUARDANDO" | "PAGO";
  sessoes?: SessaoInput[];
}

export async function criarPacoteComSessoes(input: CriarPacoteInput) {
  const {
    paciente_id,
    profissional_id,
    tipo,
    valor_cobrado,
    status_pagamento,
    sessoes = [],
  } = input;

  const limite = LIMITE_SESSOES[tipo];

  if (sessoes.length > limite) {
    throw new Error(
      `Um pacote do tipo ${tipo} aceita no máximo ${limite} sessão(ões). Você enviou ${sessoes.length}.`,
    );
  }

  for (const sessao of sessoes) {
    const slotOcupado = await prisma.agendamento.findFirst({
      where: {
        profissional_id,
        data: new Date(sessao.data),
        horario: sessao.horario,
        slot: sessao.slot,
      },
    });

    if (slotOcupado) {
      throw new Error(
        `O slot ${sessao.slot} no horário ${sessao.horario} do dia ${sessao.data} já está ocupado para o profissional.`,
      );
    }
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const pacote = await tx.pacote.create({
      data: {
        paciente_id,
        profissional_id,
        tipo,
        valor_cobrado,
        status_pagamento: status_pagamento || "AGUARDANDO",
      },
    });

    const sessoesCriadas = [];

    for (const sessao of sessoes) {
      const agendamento = await tx.agendamento.create({
        data: {
          paciente_id,
          profissional_id,
          data: new Date(sessao.data),
          horario: sessao.horario,
          slot: sessao.slot,
          tipo: (sessao.tipo as any) || "SESSAO",
        },
      });

      const sessaoPacote = await tx.sessaoPacote.create({
        data: {
          pacote_id: pacote.id,
          agendamento_id: agendamento.id,
        },
      });

      sessoesCriadas.push({ agendamento, sessaoPacote });
    }

    return { pacote, sessoes: sessoesCriadas };
  });

  return resultado;
}

interface AdicionarSessaoInput {
  pacote_id: string;
  profissional_id: string;
  paciente_id: string;
  sessao: SessaoInput;
}

export async function adicionarSessaoAoPacote(input: AdicionarSessaoInput) {
  const { pacote_id, profissional_id, paciente_id, sessao } = input;

  const pacote = await prisma.pacote.findUnique({
    where: { id: pacote_id, profissional_id },
    include: { sessoes: true },
  });

  if (!pacote) {
    throw new Error("Pacote não encontrado para o profissional.");
  }

  const limite = LIMITE_SESSOES[pacote.tipo as TipoPacote];
  const sessoesAtuais = pacote.sessoes.length;

  if (sessoesAtuais >= limite) {
    throw new Error(
      `O pacote do tipo ${pacote.tipo} já atingiu o limite de ${limite} sessão(ões).`,
    );
  }

  const slotOcupado = await prisma.agendamento.findFirst({
    where: {
      profissional_id,
      data: new Date(sessao.data),
      horario: sessao.horario,
      slot: sessao.slot,
    },
  });

  if (slotOcupado) {
    throw new Error(
      `O slot ${sessao.slot} no horário ${sessao.horario} do dia ${sessao.data} já está ocupado para o profissional.`,
    );
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const agendamento = await tx.agendamento.create({
      data: {
        paciente_id,
        profissional_id,
        data: new Date(sessao.data),
        horario: sessao.horario,
        slot: sessao.slot,
        tipo: (sessao.tipo as any) || "SESSAO",
      },
    });

    const sessaoPacote = await tx.sessaoPacote.create({
      data: {
        pacote_id,
        agendamento_id: agendamento.id,
      },
    });

    return { agendamento, sessaoPacote };
  });

  return resultado;
}
