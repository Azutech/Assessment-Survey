import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `Welcome to the Market Survey API! This API allows you to manage and retrieve information about various markets. You can add new markets, view specific market details, and search for markets based on different criteria. Explore the endpoints to get started!`;
  }
}
