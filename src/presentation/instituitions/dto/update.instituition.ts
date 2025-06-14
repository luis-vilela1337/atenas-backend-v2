import { PartialType } from '@nestjs/swagger';
import { CreateInstituitionDto } from './create.instituition';

export class UpdateInstituitionDto extends PartialType(CreateInstituitionDto) {}
