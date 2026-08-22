import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

// Traduce los errores tipados de Prisma a respuestas HTTP entendibles,
// en vez de dejar que revienten como un 500 generico.
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        switch (exception.code) {
            case 'P2002': {
                const fields = (exception.meta?.target as string[] | undefined)?.join(', ') ?? 'campo';
                response.status(HttpStatus.CONFLICT).json({
                    statusCode: HttpStatus.CONFLICT,
                    message: `Ya existe un registro con el mismo valor en: ${fields}`,
                });
                return;
            }
            case 'P2003': {
                response.status(HttpStatus.BAD_REQUEST).json({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'La referencia indicada no existe (foreign key invalida).',
                });
                return;
            }
            case 'P2025': {
                response.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Registro no encontrado.',
                });
                return;
            }
            default: {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Error de base de datos inesperado.',
                    code: exception.code,
                });
            }
        }
    }
}
