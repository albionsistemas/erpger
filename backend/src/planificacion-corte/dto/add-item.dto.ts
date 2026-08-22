import { IsInt } from 'class-validator';

export class AddItemDto {
    @IsInt()
    despieceOtId: number;
}
