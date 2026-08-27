import { JwtService } from '@nestjs/jwt';
import type { NextFunction, Request, Response } from 'express';

// app.useStaticAssets sirve /uploads/* con middleware de Express plano,
// ANTES de que el pipeline de Nest (JwtAuthGuard incluido) intervenga --
// por eso cualquier archivo ahi quedaba accesible sin login. Este
// middleware corre delante de useStaticAssets y exige la cookie que
// pone /auth/login, validada con el mismo JwtService (mismo secreto)
// que usa el resto de la API. No reemplaza el JWT de Authorization
// (ese sigue siendo para /api/*): un <img src="/uploads/..."> no puede
// mandar headers custom, por eso hace falta la cookie aparte.
export function uploadsAuthMiddleware(jwt: JwtService) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies?.uploads_token;
        if (!token) {
            res.status(401).end();
            return;
        }
        try {
            await jwt.verifyAsync(token);
            next();
        } catch {
            res.status(401).end();
        }
    };
}
