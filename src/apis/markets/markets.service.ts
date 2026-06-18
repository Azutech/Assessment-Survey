import { Injectable } from '@nestjs/common';
import { CreateMarketDto } from './dto/market.dto';

@Injectable()
export class MarketsService {
  create(createMarketDto: CreateMarketDto) {
    return 'This action adds a new market';
  }

  findAll() {
    return `This action returns all markets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} market`;
  }

  remove(id: number) {
    return `This action removes a #${id} market`;
  }
}
