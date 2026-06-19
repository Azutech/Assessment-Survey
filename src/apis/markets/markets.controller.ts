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
  Query,
  Search,
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { CreateMarketDto, QueryMarketDto } from './dto/market.dto';
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

  @Get('viewMarket')
  async viewMarket(@Query('id') id: string, @Res() res: Response) {
    const market = await this.marketsService.viewMarket(id);
    return res.status(HttpStatus.OK).json({ msg: 'Market found', market });
  }

  @Get('findAllMarkets')
  // @UsePipes(new ZodValidationPipe())
  async findAllMarkets(
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('marketEntity') marketEntity?: string,
  ) {
    const markets = await this.marketsService.findAllMarkets(
      search,
      marketEntity,
    );
    return res.status(HttpStatus.OK).json({ msg: 'Markets found', markets });
  }
}
