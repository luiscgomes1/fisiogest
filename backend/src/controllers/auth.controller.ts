import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY!;
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY!;

function generateTokens(profissionalId: string) {
    const secret = process.env.JWT_SECRET!;

    const accessToken = jwt.sign(
        { id: profissionalId },
        secret,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
        { id: profissionalId },
        secret,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
}

export async function login(req: Request, res: Response) {
    const { email, senha } = req.body;

    if(!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const profissional = await prisma.profissional.findUnique({
        where: { email }
    });

    if (!profissional) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const correctPassword = await bcrypt.compare(senha, profissional.senha_hash);

    if (!correctPassword) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const tokens = generateTokens(profissional.id);

    return res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        profissional: {
            id: profissional.id,
            nome: profissional.nome,
            email: profissional.email,
        }
    });
}

export async function refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ erro: 'Refresh token não fornecido.' });
    }

    try {
        const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { id: string};

        const tokens = generateTokens(payload.id);

        return res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    } catch {
        return res.status(401).json({ erro: 'Refresh token inválido ou expirado.' });
    }
}