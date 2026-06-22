import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class OptionalBoolPipe implements PipeTransform {
  transform(value: any): boolean | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (value === 'true') return true;
    if (value === 'false') return false;

    return undefined;
  }
}
