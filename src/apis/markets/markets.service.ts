import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateMarketDto } from './dto/market.dto';
import { MarketRepository } from './repository/market.repository';
import { trimObjectStrings } from 'src/common/utils/trim-Object.util';
import { MarketEntity } from './enums/market.enum';

@Injectable()
export class MarketsService {
  constructor(private readonly marketRepository: MarketRepository) {}
  async addMarket(createMarketDto: CreateMarketDto) {
    const sanitizedDto = trimObjectStrings(createMarketDto);
    let { marketName, marketEntity } = sanitizedDto;

    const market = await this.marketRepository.findOne({
      marketName: { $regex: new RegExp(`^${marketName}$`, 'i') },
    });

    if (market) {
      throw new ConflictException('Market with this name already exists');
    }

    const validMarketEntities = Object.values(MarketEntity);
    if (!validMarketEntities.includes(marketEntity as MarketEntity)) {
      throw new BadRequestException(
        `Invalid market entity. Valid values are: ${validMarketEntities.join(', ')}`,
      );
    }

    const newMarket = await this.marketRepository.create(sanitizedDto);

    return newMarket;
  }

  findAll() {
    return `This action returns all markets`;
  }

  async viewMarket(id: string): Promise<any> {
    const market = await this.marketRepository.findOne({ _id: id });

    if (!market) {
      throw new BadRequestException('Market not found');
    }

    return market;
  }

  remove(id: number) {
    return `This action removes a #${id} market`;
  }
}
