import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `Welcome to the Market Survey API! This API allows you to manage and retrieve information about various markets! 🚀🚀`;
  }
}
