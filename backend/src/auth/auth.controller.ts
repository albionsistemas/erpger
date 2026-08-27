import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from './types';

// Cookie separada del accessToken de localStorage/Authorization: hace
// falta porque <img src="/uploads/...">, <a href> a PDF/DXF, etc. no
// pueden mandar el header Authorization -- ver uploads-auth.middleware.ts.
const UPLOADS_COOKIE = 'uploads_token';
const UPLOADS_COOKIE_OPTS = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24h, independiente del vencimiento del JWT (el middleware igual lo valida)
};

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Public()
    @Post('login')
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.auth.login(dto);
        res.cookie(UPLOADS_COOKIE, result.accessToken, UPLOADS_COOKIE_OPTS);
        return result;
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie(UPLOADS_COOKIE);
    }

    @Get('me')
    me(@CurrentUser() user: JwtPayload) {
        return this.auth.me(BigInt(user.sub));
    }
}
