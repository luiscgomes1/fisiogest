import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { gerarPDFLaudo } from '../services/laudo.service'

function formatarData(data: Date | string): string {
    const d = new Date(data)
    return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

export async function criarLaudo(req: Request, res: Response) {
    const { id: paciente_id } = req.params

    const paciente = await prisma.paciente.findFirst({
        where: { id: paciente_id, profissional_id: req.profissionalId }
    })

    if(!paciente) {
        return res.status(404).json({ erro: 'Paciente não encontrado' })
    }

    const prontuario = await prisma.prontuario.findUnique({
        where: { paciente_id }
    })

    if(!prontuario) {
        return res.status(400).json({
            erro: 'É necessário preencher a avaliação inicial antes de gerar um laudo.'
        })
    }

    const conteudo = {
        quadro_clinico: prontuario.hda || 'Não informado',
        achados_exame: prontuario.avaliacao_fisica || 'Não informado',
        diagnostico_funcional: prontuario.diagnostico_fisio || 'Não informado',
        conclusao: '',
        diagnostico_medico: prontuario.diagnostico_medico || 'Não informado',
        medico_solicitante: prontuario.medico_solicitante || 'Não informado',
        data_inicio: formatarData(prontuario.criado_em),
        frequencia_semanal: 'Não informado',
    }

    const laudo = await prisma.laudo.create({
        data: {
            paciente_id,
            profissional_id: req.profissionalId!,
            conteudo,
            tipo_assinatura: req.body.tipo_assinatura || 'MANUSCRITA',
        }
    })

    return res.status(201).json(laudo)
}

export async function listarLaudos(req: Request, res: Response) {
    const { id: paciente_id } = req.params

    const paciente = await prisma.paciente.findFirst({
        where: { id: paciente_id, profissional_id: req.profissionalId }
    })

    if(!paciente) {
        return res.status(404).json({ erro: 'Paciente não encontrado' })
    }

    const laudos = await prisma.laudo.findMany({
        where: { paciente_id, profissional_id: req.profissionalId },
        orderBy: { criado_em: 'desc' },
        select: {
            id: true,
            conteudo: true,
            tipo_assinatura: true,
            criado_em: true,
        }
    })

    return res.json(laudos)
}

export async function buscarLaudo(req: Request, res: Response) {
    const { id } = req.params

    const laudo = await prisma.laudo.findFirst({
        where: { id, profissional_id: req.profissionalId },
        include: {
            paciente: {
                select: {
                    id: true, nome: true, data_nascimento: true
                }
            }
        }
    })

    if(!laudo) {
        return res.status(404).json({ erro: 'Laudo não encontrado' })
    }

    return res.json(laudo)
}

export async function editarLaudo(req: Request, res: Response) {
    const { id } = req.params
    const { conteudo, tipo_assinatura } = req.body

    const laudo = await prisma.laudo.findFirst({
        where: { id, profissional_id: req.profissionalId }
    })

    if(!laudo) {
        return res.status(404).json({ erro: 'Laudo não encontrado' })
    }

    const laudoAtualizado = await prisma.laudo.update({
        where: { id },
        data: {
            conteudo: { ...(laudo.conteudo as object), ...conteudo },
            ...(tipo_assinatura && { tipo_assinatura }),
        }
    })

    return res.json(laudoAtualizado)
}

export async function gerarPDF(req: Request, res: Response) {
    const { id } = req.params

    const laudo = await prisma.laudo.findFirst({
        where: { id, profissional_id: req.profissionalId },
        include: {
            paciente: {
                select: { nome: true, data_nascimento: true }
            },
            profissional: {
                select: {
                    nome: true,
                    crefito: true,
                    cidade: true,
                    uf: true,
                    assinatura_url: true,
                }
            }
        }
    })

    if(!laudo) {
        return res.status(404).json({ erro: 'Laudo não encontrado' })
    }

    const conteudo = laudo.conteudo as any

    gerarPDFLaudo({
        cidade: laudo.profissional.cidade,
        uf: laudo.profissional.uf,
        data: formatarData(new Date()),
        paciente_nome: laudo.paciente.nome,
        paciente_nascimento: formatarData(laudo.paciente.data_nascimento),
        diagnostico_medico: conteudo.diagnostico_medico || 'Não informado',
        medico_solicitante: conteudo.medico_solicitante || 'Não informado',
        data_inicio: conteudo.data_inicio || 'Não informado',
        frequencia_semanal: conteudo.frequencia_semanal || 'Não informado',
        quadro_clinico: conteudo.quadro_clinico || 'Não informado',
        achados_exame: conteudo.achados_exame || 'Não informado',
        diagnostico_funcional: conteudo.diagnostico_funcional || 'Não informado',
        conclusao: conteudo.conclusao || 'Não informado',
        profissional_nome: laudo.profissional.nome,
        profissional_crefito: laudo.profissional.crefito,
        assinatura_url: laudo.profissional.assinatura_url || null,
        tipo_assinatura: laudo.tipo_assinatura,
        logo_url: null,
    }, res)
}