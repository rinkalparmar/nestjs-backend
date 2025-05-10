import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { Schema } from 'yup';

@Injectable()
export class YupValidationPipe implements PipeTransform {
  constructor(private schema: Schema<unknown>) {}

  async transform(value: any, _metadata: ArgumentMetadata) {
    try {
      return await this.schema.validate(value, {
        abortEarly: false, // collect all errors
        stripUnknown: true, // remove unexpected fields
      });
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = err.errors.join(', ');
        throw new BadRequestException(`Validation failed: ${errors}`);
      }
      throw err;
    }
  }
}
