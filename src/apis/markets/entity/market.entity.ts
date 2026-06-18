// markets/schemas/market.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { startOfSecond } from 'date-fns';
import { Document } from 'mongoose';

export type MarketDocument = Market & Document;

export class Market {
  @Prop({ required: true, trim: true })
  marketName: string;

  @Prop({ required: true, trim: true })
  LGA: string;

  @Prop({ required: true, trim: true })
  marketState: string;

  @Prop({ type: String, required: false })
  marketEntity: string;

  @Prop({ type: String, required: false })
  marketGPS: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: Date,
    default: () => startOfSecond(new Date()),
  })
  createdAt: Date;
}

export const MarketSchema = SchemaFactory.createForClass(Market);
