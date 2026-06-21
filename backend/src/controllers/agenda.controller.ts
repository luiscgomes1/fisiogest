import { Request, Response } from 'express';
import prisma from '../lib/prisma';

function gerarHorarios(horarioInicio: string, horarioFim: string): string[] {
    const horarios: string[] = [];

    const horaInicio = parseInt(horarioInicio.split(':')[0]);
    const horaFim = parseInt(horarioFim.split(':')[0]);

    for (let hora = horaInicio; hora < horaFim; hora++) {
        const horaFormatada = hora.toString().padStart(2, '0');
        horarios.push(`${horaFormatada}:00`);
    }

    return horarios;
}

export async function buscarAgendaDia(req: Request, res: Response) {
    const dataQuery = req.query.data as string | undefined;

    if (!dataQuery) {
        return res.status(400).json({ erro: 'Data é obrigatória (formato: YYYY-MM-DD).' });
    }

    const profissional = await prisma.profissional.findUnique({
        where: { id: req.profissionalId },
        select: { horario_inicio: true, horario_fim: true }
    });

    if (!profissional) {
        return res.status(404).json({ erro: 'Profissional não encontrado' });
    }

    const agendamentos = await prisma.agendamento.findMany({
        where: {
            profissional_id: req.profissionalId,
            data: new Date(dataQuery),
        },
        include: {
            paciente: {
                select: { id: true, nome: true }
            }
        }
    });

    const horariosDoDia = gerarHorarios(profissional.horario_inicio, profissional.horario_fim);

    const grade = horariosDoDia.map((horario) => {
        const slots = [1, 2, 3].map((numeroSlot) => {
            const agendamentoDoSlot = agendamentos.find(
                (agendamento) => agendamento.horario === horario && agendamento.slot === numeroSlot
            )

            return {
                slot: numeroSlot,
                agendamento: agendamentoDoSlot ?? null,
            }
        })

        return { horario, slots };
    })

    return res.json({
        data: dataQuery,
        horarios: grade,
    })
}

export async function criarAgendamento(req: Request, res: Response)  {
    const { paciente_id, data, horario, slot, tipo } = req.body;
    
    if (!paciente_id || !data || !horario || !slot) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    if (![1, 2, 3].includes(slot)) {
        return res.status(400).json({ erro: 'Slot inválido. Deve ser 1, 2 ou 3.' });
    }

    const paciente = await prisma.paciente.findFirst({
        where: {
            id: paciente_id,
            profissional_id: req.profissionalId,
        }
    });

    if (!paciente) {
        return res.status(404).json({ erro: 'Paciente não encontrado.' });
    }

    const profissional = await prisma.profissional.findUnique({
        where: { id: req.profissionalId },
        select: { horario_inicio: true, horario_fim: true }
    });

    const horariosValidos = gerarHorarios(profissional!.horario_inicio, profissional!.horario_fim);

    if (!horariosValidos.includes(horario)) {
        return res.status(400).json({ erro: `Horário fora do expediente configurado (${profissional!.horario_inicio} às ${profissional!.horario_fim}).` });
    }

    const slotOcupado = await prisma.agendamento.findFirst({
        where: {
            profissional_id: req.profissionalId,
            data: new Date(data),
            horario,
            slot,
        }
    });

    if (slotOcupado) {
        return res.status(400).json({ erro: 'Slot já está ocupado para o horário selecionado.' });
    }

    const agendamento = await prisma.agendamento.create({
        data: {
            paciente_id,
            profissional_id: req.profissionalId!,
            data: new Date(data),
            horario,
            slot,
            tipo: tipo || 'SESSAO'
        },
        include: {
            paciente: {
                select: { id: true, nome: true }
            }
        }
    })

    return res.status(201).json(agendamento);
}

export async function atualizarStatusAgendamento(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const statusesValidos = ['AGENDADO', 'COMPARECEU', 'FALTOU', 'DESMARCOU'];

    if (!status || !statusesValidos.includes(status)) {
        return res.status(400).json({ 
            erro: `Status inválido. Use um dos seguintes: ${statusesValidos.join(', ')}.`
        });
    }

    const agendamento = await prisma.agendamento.findFirst({
        where: { id, profissional_id: req.profissionalId },
    })

    if (!agendamento) {
        return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    const statusFinais = ['COMPARECEU', 'FALTOU'];

    if(statusFinais.includes(agendamento.status)) {
        return res.status(400).json({ erro: `Esse agendamento já está com status "${agendamento.status}" e não pode ser alterado por aqui.` });
    }

    const agendamentoAtualizado = await prisma.agendamento.update({
        where: { id },
        data: { status },
        include: {
            paciente: {
                select: { id: true, nome: true }
            }
        }
    })

    return res.json(agendamentoAtualizado);
}