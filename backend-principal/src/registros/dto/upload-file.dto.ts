import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({ 
    example: 'uuid-del-nino', 
    description: 'ID del niño al que pertenece el registro' 
  })
  @IsUUID()
  ninoId: string;
}
