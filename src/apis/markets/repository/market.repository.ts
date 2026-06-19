import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Market } from '../entity/market.entity';
import { Model } from 'mongoose';
import { CreateMarketDto } from '../dto/market.dto';
import { PropDataInput } from 'src/common/utils/utils.interface';
import { MarketI } from '../interfaces/market.interface';

@Injectable()
export class MarketRepository {
  constructor(@InjectModel(Market.name) private marketModel: Model<Market>) {}

  async upsert(dto: CreateMarketDto) {
    return this.marketModel.findOneAndUpdate(
      { marketName: dto.marketName },
      {
        $set: {
          marketName: dto.marketName,
          marketEntity: dto.marketEntity,
          marketState: dto.marketState,
          marketLGA: dto.marketLGA,
          marketGPS: dto.marketGPS,
        },
      },
      {
        upsert: true,
        returnDocument: 'after', // ✅ replaces "new: true"
      },
    );
  }
  async create(market: MarketI): Promise<Market> {
    const createdMarket = new this.marketModel(market);
    return createdMarket.save();
  }

  async findAll(): Promise<Market[]> {
    return this.marketModel.find().exec();
  }

  async findOne(
    where: PropDataInput,
    attribute?: string,
  ): Promise<Market | null> {
    return this.marketModel.findOne(where).select(attribute).exec();
  }
}
