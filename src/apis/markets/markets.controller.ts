import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { CreateMarketDto } from './dto/market.dto';
import { Response } from 'express';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Post('addMarket')
  @UsePipes(new ZodValidationPipe())
  async create(@Body() createMarketDto: CreateMarketDto, @Res() res: Response) {
    const newMarket = await this.marketsService.addMarket(createMarketDto);

    return res
      .status(HttpStatus.CREATED)
      .json({ msg: 'Market added successfully', newMarket });
  }
}
