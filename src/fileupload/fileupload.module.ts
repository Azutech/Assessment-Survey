import { Module } from '@nestjs/common';
import { FileUploadService } from './fileupload.service';
import { FileUploadController } from './fileupload.controller';

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService],
})
export class FileuploadModule {}
