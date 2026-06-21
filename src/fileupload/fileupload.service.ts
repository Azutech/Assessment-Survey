import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3,
  PutObjectCommandInput,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly allowedMimeTypes: string[] = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/heic',
    'text/csv',
    'application/pdf',
    'application/json',
  ];

  private s3: S3;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      region: this.configService.get<string>('NEW_REGION'),
      endpoint: this.configService.get<string>('NEW_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('NEW_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('NEW_SECRET_KEY'),
      },
    });
  }

  async uploadFile(file: any) {
    // Validate file
    if (!file || !this.isMimeTypeAllowed(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type. Allowed types are: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    try {
      const fileName = this.generateFileName(file.originalname);
      const fileType = this.getFileExtension(file.originalname);

      const params: PutObjectCommandInput = {
        Bucket: this.configService.get<string>('NEW_BUCKET_NAME'),
        Key: `${this.configService.get<string>('CRM_SURVEY_FILE_DIR')}/${fileName}.${fileType}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Use a valid canned ACL string
      };

      // Upload file to S3/DigitalOcean Spaces
      const data = await this.s3.send(new PutObjectCommand(params)); // Use send method with PutObjectCommand

      const bucketName = this.configService.get<string>('NEW_BUCKET_NAME');
      const spacesEndpoint = this.configService.get<string>('NEW_ENDPOINT');
      const fileUrl = `${spacesEndpoint}/${bucketName}/${params.Key}`;

      // Return uploaded file details
      return {
        name: fileName,
        type: fileType,
        url: fileUrl,
      };
    } catch (error: any) {
      throw new Error(
        `File upload failed: ${error.message}. Location: FileUploadService.uploadFile`,
      );
    }
  }
  async uploadFileSignature(file: any) {
    // Validate file
    if (!file || !this.isMimeTypeAllowed(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type. Allowed types are: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    try {
      const fileName = this.generateFileName(file.originalname);
      const fileType = this.getFileExtension(file.originalname);

      const params: PutObjectCommandInput = {
        Bucket: this.configService.get<string>('NEW_BUCKET_NAME'),
        Key: `${this.configService.get<string>('CRM_SIGNATURE_FILE_DIR')}/${fileName}.${fileType}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Use a valid canned ACL string
      };

      // Upload file to S3/DigitalOcean Spaces
      const data = await this.s3.send(new PutObjectCommand(params)); // Use send method with PutObjectCommand

      const bucketName = this.configService.get<string>('NEW_BUCKET_NAME');
      const spacesEndpoint = this.configService.get<string>('NEW_ENDPOINT');
      const fileUrl = `${spacesEndpoint}/${bucketName}/${params.Key}`;

      // Return uploaded file details
      return {
        name: fileName,
        type: fileType,
        url: fileUrl,
      };
    } catch (error: any) {
      throw new Error(
        `File upload failed: ${error.message}. Location: FileUploadService.uploadFile`,
      );
    }
  }

  async listFilesQuery(type?: string): Promise<any[]> {
    const bucketName = this.configService.get<string>('NEW_BUCKET_NAME');
    const directory = this.configService.get<string>('CRM_SURVEY_FILE_DIR');
    const spacesEndpoint = this.configService.get<string>('NEW_ENDPOINT');

    try {
      const params = {
        Bucket: bucketName,
        Prefix: `${directory}/`,
      };

      const data = await this.s3.listObjectsV2(params);

      if (data.Contents && data.Contents.length > 0) {
        return data.Contents.map((file) => ({
          key: file.Key,
          url: `${spacesEndpoint}/${bucketName}/${file.Key}`,
          size: file.Size,
          lastModified: file.LastModified,
        }))
          .filter((file) => {
            if (!type) return true;
            const filename = file.key.split('/').pop()?.toLowerCase() ?? '';
            return filename.includes(type.toLowerCase());
          })
          .sort(
            (a, b) =>
              new Date(b.lastModified).getTime() -
              new Date(a.lastModified).getTime(),
          );
      } else {
        throw new BadRequestException(
          'No files found in the specified directory.',
        );
      }
    } catch (error: any) {
      throw new Error(
        `Failed to list files: ${error.message}. Location: FileUploadService.listFiles`,
      );
    }
  }
  async listSignatureQuery(type?: string): Promise<any[]> {
    const bucketName = this.configService.get<string>('NEW_BUCKET_NAME');
    const directory = this.configService.get<string>('CRM_SIGNATURE_FILE_DIR');
    const spacesEndpoint = this.configService.get<string>('NEW_ENDPOINT');

    try {
      const params = {
        Bucket: bucketName,
        Prefix: `${directory}/`,
      };

      const data = await this.s3.listObjectsV2(params);

      if (data.Contents && data.Contents.length > 0) {
        return data.Contents.map((file) => ({
          key: file.Key,
          url: `${spacesEndpoint}/${bucketName}/${file.Key}`,
          size: file.Size,
          lastModified: file.LastModified,
        }))
          .filter((file) => {
            if (!type) return true;
            const filename = file.key.split('/').pop()?.toLowerCase() ?? '';
            return filename.includes(type.toLowerCase());
          })
          .sort(
            (a, b) =>
              new Date(b.lastModified).getTime() -
              new Date(a.lastModified).getTime(),
          );
      } else {
        throw new BadRequestException(
          'No files found in the specified directory.',
        );
      }
    } catch (error: any) {
      throw new Error(
        `Failed to list files: ${error.message}. Location: FileUploadService.listFiles`,
      );
    }
  }

  async deleteFile(fileKey: string) {
    if (!fileKey) {
      throw new BadRequestException('File key is required for deletion');
    }

    try {
      // If full URL is passed, extract only the path after the bucket name
      const bucketName = this.configService.get<string>('NEW_BUCKET_NAME');

      let key = fileKey;

      if (fileKey.startsWith('http')) {
        const parts = fileKey.split(`/${bucketName}/`);
        key = parts.length > 1 ? parts[1] : fileKey;
      }

      const params = {
        Bucket: bucketName,
        Key: key,
      };

      await this.s3.deleteObject(params);

      return { message: 'File deleted successfully', key };
    } catch (error: any) {
      throw new Error(
        `File deletion failed: ${error.message}. Location: FileUploadService.deleteFile`,
      );
    }
  }

  private generateFileName(originalName: string): string {
    return `${uuidv4().replace(/-/g, '').toUpperCase()}-${this.getFileBaseName(originalName)}`;
  }

  private getFileBaseName(originalName: string): string {
    const splitName = originalName.split('.');
    return splitName.slice(0, -1).join('.');
  }

  private getFileExtension(originalName: string): string {
    const splitName = originalName.split('.');
    return splitName.pop()?.toLowerCase() || 'unknown';
  }

  private isMimeTypeAllowed(mimeType: string): boolean {
    return this.allowedMimeTypes.includes(mimeType);
  }
}
