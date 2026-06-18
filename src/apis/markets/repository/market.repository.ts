import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Market } from '../entity/market.entity';
import { Model } from 'mongoose';
import { CreateMarketDto } from '../dto/market.dto';

@Injectable()
export class MarketRepository {
  constructor(@InjectModel(Market.name) private marketModel: Model<Market>) {}

//   async upsert(dto: CreateMarketDto) {
//     return this.marketModel.findOneAndReplace(
//       { marketName: dto.marketName }, // ✅ correct field
//       {
//         $set: {
//           marketName: dto.marketName,
//           marketEntity: dto.marketEntity,
//           marketState: dto.marketState,
//           LGA: dto.marketLGA,
//           marketGPS: dto.marketGPS,
//         },
//       },
//       { upsert: true, new: true },
//     );
//   }


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
  async create(market: Market): Promise<Market> {
    const createdMarket = new this.marketModel(market);
    return createdMarket.save();
  }

  async findAll(): Promise<Market[]> {
    return this.marketModel.find().exec();
  }

  async findOne(id: string): Promise<Market> {
    return this.marketModel.findById(id).exec();
  }
}
