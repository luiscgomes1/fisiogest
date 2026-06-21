import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            profissionalId?: string;
        }
    }
}

export function authenticate (req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        req.profissionalId = payload.id;

        next();
    } catch {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
}