import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Market } from '../entity/market.entity';
import { QueryFilter, Model } from 'mongoose';
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
          popularLandmark: dto.popularLandmark,
          marketBuildingsType: dto.marketBuildingsType,
          powerSource: dto.powerSource,
          gridInfrastructure: dto.gridInfrastructure,
          marketDescription: dto.marketDescription,
          LGA_Eligibility: dto.LGA_Eligibility,
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

  async findAllMarkets(
    where: PropDataInput,
    search?: string,
    marketEntity?: string,
  ) {
    const query: any = { ...where };

    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        $or: [
          { marketName: { $regex: search, $options: 'i' } },
          { marketLGA: { $regex: search, $options: 'i' } },
          { marketState: { $regex: search, $options: 'i' } },
          { marketEntity: { $regex: search, $options: 'i' } },
          { popularLandmark: { $regex: search, $options: 'i' } },
          { marketDescription: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (marketEntity) {
      andConditions.push({
        marketEntity: {
          $regex: `^${marketEntity}$`,
          $options: 'i',
        },
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const results = await this.marketModel.find(query).exec();
    return results;
  }

  async findOne(
    where: PropDataInput,
    attribute?: string,
  ): Promise<Market | null> {
    return this.marketModel.findOne(where).select(attribute).exec();
  }
}
