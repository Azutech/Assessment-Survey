import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';


@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger('GlobalExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    if (exception?.constructor?.name === 'ZodValidationException') {
      const zodError = exception.getZodError?.();
      const errors =
        zodError?.issues?.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        })) ?? [];

      return response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        status: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
        errors,
      });
    }

    this.logger.error({
      message: exception.message,
      status: exception.status || HttpStatus.INTERNAL_SERVER_ERROR,
      stack: exception.stack,
    });

    const status = exception.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message || 'Internal server error';

    response.status(status).json({
      success: false,
      message,
      status,
      timestamp: new Date().toISOString(),
    });
  }
}
