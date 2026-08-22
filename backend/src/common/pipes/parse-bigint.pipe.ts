import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

// Casi todas las PK del schema son BIGINT (BigInt en Prisma/JS). Este pipe
// reemplaza a ParseIntPipe para los parametros de ruta que identifican
// esos registros.
@Injectable()
export class ParseBigIntPipe implements PipeTransform<string, bigint> {
    transform(value: string, metadata: ArgumentMetadata): bigint {
        try {
            return BigInt(value);
        } catch {
            throw new BadRequestException(`"${value}" no es un id valido para ${metadata.data}`);
        }
    }
}
