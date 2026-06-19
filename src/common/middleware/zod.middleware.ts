import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch(ZodValidationException)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    console.log('ZodError:', JSON.stringify(exception.getZodError(), null, 2));

    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const errors = (exception.getZodError() as ZodError).issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      status: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      errors,
    });
  }
}
