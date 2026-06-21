import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

export async function buscarPerfil(req: Request, res: Response) {

    const profissional = await prisma.profissional.findUnique({
        where: { id: req.profissionalId },
        select: {
            id: true,
            nome: true,
            email: true,
            crefito: true,
            cidade: true,
            uf: true,
            assinatura_url: true,
            horario_inicio: true,
            horario_fim: true,
            preco_sessao_individual: true,
            preco_pacote_5: true,
            preco_pacote_10: true,
        }
    });

    if (!profissional) {
        return res.status(404).json({ erro: 'Profissional não encontrado' });
    }

    res.json(profissional);
}

export async function atualizarPerfil(req: Request, res: Response) {
    const profissional = req.body;

    const profissionalAtualizado = await prisma.profissional.update({
        where: { id: req.profissionalId },
        data: {
            nome: profissional.nome,
            crefito: profissional.crefito,
            cidade: profissional.cidade,
            uf: profissional.uf,
            horario_inicio: profissional.horario_inicio,
            horario_fim: profissional.horario_fim,
            preco_sessao_individual: profissional.preco_sessao_individual,
            preco_pacote_5: profissional.preco_pacote_5,
            preco_pacote_10: profissional.preco_pacote_10,
        },
        select: {
            id: true,
            nome: true,
            email: true,
            crefito: true,
            cidade: true,
            uf: true,
            horario_inicio: true,
            horario_fim: true,
            preco_sessao_individual: true,
            preco_pacote_5: true,
            preco_pacote_10: true,
        }
    })

    return res.json(profissionalAtualizado);
}

export async function trocarSenha(req: Request, res: Response) {
    const { senhaAtual, novaSenha } = req.body;

    if(!senhaAtual || !novaSenha) {
        return res.status(400).json({ erro: 'Senha atual e nova senha são obrigatórias' });
    }

    if(novaSenha.length < 6) {
        return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres' });
    }

    const profissional = await prisma.profissional.findUnique({
        where: { id: req.profissionalId }
    });

    if(!profissional) {
        return res.status(404).json({ erro: 'Profissional não encontrado' });
    }

    const senhaCorreta = await bcrypt.compare(senhaAtual, profissional.senha_hash);

    if(!senhaCorreta) {
        return res.status(400).json({ erro: 'Senha atual incorreta' });
    }

    const novoHash = await bcrypt.hash(novaSenha, 10);

    await prisma.profissional.update({
        where: { id: req.profissionalId },
        data: { senha_hash: novoHash }
    });

    return res.json({ mensagem: 'Senha atualizada com sucesso' });
}