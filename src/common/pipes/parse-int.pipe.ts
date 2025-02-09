import { HttpException } from '@nestjs/common';
import {
  PipeTransform,
  ArgumentMetadata,
  HttpStatus,
} from '@nestjs/common';

export class ParseIntPipe implements PipeTransform<string> {
  async transform(value: string, metadata: ArgumentMetadata) {
    console.log(`PipeTranform...`); // [ApplicationModule] Request...    
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new HttpException('Validation failed', HttpStatus.BAD_REQUEST);
    }
    return val;
  }
}
