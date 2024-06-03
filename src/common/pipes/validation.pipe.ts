import { HttpException } from '@nestjs/common';
import { PipeTransform, ArgumentMetadata, HttpStatus } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { pipe } from 'rxjs';

export class ValidationPipe implements PipeTransform<any> {
    async transform(value, metadata: ArgumentMetadata) {
        console.log(
            '🚀 ~ file: validation.pipe.ts:13 ~ ValidationPipe ~ transform ~ value:',
            value,
        );
        console.log(
            '🚀 ~ file: validation.pipe.ts:13 ~ ValidationPipe ~ transform ~ metadata:',
            metadata,
        );
        const { metatype } = metadata;
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = plainToClass(metatype, value);
        const errors = await validate(object);
        if (errors.length > 0) {
            throw new HttpException('Validation failed', HttpStatus.BAD_REQUEST);
        }
        return value;
    }

    private toValidate(metatype): boolean {
        const types = [String, Boolean, Number, Array, Object];
        return !types.find((type) => metatype === type);
    }
}
