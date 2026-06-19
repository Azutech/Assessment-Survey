import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './fileupload.service';
import { Request, Response } from 'express';
import type * as Multer from 'multer';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';


@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Maximum 10 files at a time
  async uploadMultipleFiles(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Response> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadResults = [];
    for (const file of files) {
      const data = await this.fileUploadService.uploadFile(file);
      uploadResults.push(data);
    }

    return res.status(HttpStatus.OK).json({
      message: 'Successfully uploaded files',
      files: uploadResults,
    });
  }
  @Post('uploadFileSignature')
  @UseInterceptors(FilesInterceptor('files', 10)) // Maximum 10 files at a time
  async uploadMultipleSignature(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Response> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadResults = [];
    for (const file of files) {
      const data = await this.fileUploadService.uploadFileSignature(file);
      uploadResults.push(data);
    }

    return res.status(HttpStatus.OK).json({
      message: 'Successfully uploaded files',
      files: uploadResults,
    });
  }

  @Get('listFilesQuery')
  async listFilesQuery(@Res() res: Response, @Query('type') type?: string) {
    try {
      const files = await this.fileUploadService.listFilesQuery(type);
      return res.status(HttpStatus.OK).json({
        message: 'Files retrieved successfully',
        files,
      });
    } catch (error: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to retrieve files',
        error: error.message,
      });
    }
  }
  @Get('listSignatureQuery')
  async listSignatureQuery(@Res() res: Response, @Query('type') type?: string) {
    try {
      const files = await this.fileUploadService.listSignatureQuery(type);
      return res.status(HttpStatus.OK).json({
        message: 'Files retrieved successfully',
        files,
      });
    } catch (error: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to retrieve files',
        error: error.message,
      });
    }
  }

  @Delete('removefileKey')
  async deleteFile(@Res() res: Response, @Query('fileKey') fileKey: string) {
    try {
      const files = this.fileUploadService.deleteFile(fileKey);
      return res.status(HttpStatus.OK).json({
        message: 'Files deleted successfully',
        files,
      });
    } catch (error: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to retrieve files',
        error: error.message,
      });
    }
  }
}
