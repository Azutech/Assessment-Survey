import { Module } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';
import { Market, MarketSchema } from './entity/market.entity';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';

@Module({
  imports: [
        MongooseModule.forFeature([
      { name: Market.name, schema: MarketSchema },
  ])
],
  controllers: [MarketsController],
  providers: [MarketsService],
})
export class MarketsModule {}
