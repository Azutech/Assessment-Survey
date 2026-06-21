import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  private jwtSecret;

  constructor(private readonly configService: ConfigService) {
    this.jwtSecret = this.configService.get('JWT_SECRET');
  }
  private algorithm = 'aes-256-ctr';
  private secretKey = Buffer.from(process.env.JWT_ENCRYPTION_KEY, 'base64');

  createEncryptedToken(payload: object): string {
    try {
      const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
      const encrypted = Buffer.concat([cipher.update(token), cipher.final()]);
      return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  verifyAndDecryptToken(encryptedToken: string): any {
    const [iv, encryptedText] = encryptedToken.split(':');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.secretKey,
      Buffer.from(iv, 'hex'),
    );
    const decryptedToken = Buffer.concat([
      decipher.update(Buffer.from(encryptedText, 'hex')),
      decipher.final(),
    ]);

    return jwt.verify(decryptedToken.toString(), this.jwtSecret);
  }
}
