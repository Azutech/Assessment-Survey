import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { marketsSeed } from '../apis/markets/seeds.markets';
import { MarketRepository } from '../apis/markets/repository/market.repository';
import { CreateMarketDto } from '../apis/markets/dto/market.dto';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const marketRepository = app.get(MarketRepository);

  for (const market of marketsSeed) {
    await marketRepository.upsert(market as CreateMarketDto);
  }

  console.log(`Seeded ${marketsSeed.length} markets`);
  await app.close();
}

run();
