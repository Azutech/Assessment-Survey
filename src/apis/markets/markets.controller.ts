import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { CreateMarketDto } from './dto/market.dto';
import { Response } from 'express';

@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Post('addMarket')
  async create(@Body() createMarketDto: CreateMarketDto, @Res() res: Response) {
    const newMarket = await this.marketsService.addMarket(createMarketDto);

    return res
      .status(HttpStatus.CREATED)
      .json({ msg: 'Market added successfully', newMarket });
  }

  @Get()
  findAll() {
    return this.marketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marketsService.remove(+id);
  }
}
