import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { startOfSecond } from 'date-fns';
import { Images } from '../interfaces/survey.interface';

const ApplianceSchema = raw({
  name: String,
  quantity: Number,
  hoursPerDay: Number,
  watts: Number,
  totalConsumption: Number,
});

export type SurveyDocument = Survey & Document;

export class Survey {
  @Prop({ type: String, required: false })
  marketName: string;

  @Prop({ type: String, required: false })
  marketLGA: string;

  @Prop({ type: String, required: false })
  marketEntity: string;

  @Prop({ type: String, required: false })
  marketState: string;

  @Prop({ type: String, required: true })
  businessName: string;

  @Prop({ type: String, required: false })
  businessCategory: string;

  @Prop({ type: String, required: false })
  businessType: string;

  @Prop({ type: String, required: false })
  customerName: string;

  @Prop({ type: String, required: false })
  gender: string;

  @Prop({ type: String, required: false })
  phoneNumber: string;

  @Prop({ type: String, required: false })
  shopNumber: string;

  @Prop({ type: String, required: false })
  shopBlock: string;

  @Prop({ type: String, required: false })
  shopSection: string;

  @Prop({ type: String, required: false })
  shopSectionNumber: string;

  @Prop({ type: String, required: false })
  ageRange: string;

  @Prop({ type: String, required: false })
  numberOfEmployees: string;

  @Prop({ type: String, required: false })
  currentEnergySource: string;

  @Prop({ type: Boolean, required: false })
  generatorOwnership: boolean;

  @Prop({ type: [String], required: false })
  energyChallenges: string[];

  @Prop({ type: String, required: false })
  applianceUsed: string;

  @Prop({ type: String, required: false })
  willingnessToPay: string;

  @Prop({ type: String, required: false })
  paymentPreference: string;

  @Prop({ type: String, required: false })
  electricitySupply: string;

  @Prop({ type: String, required: false })
  dailyEnergyConsumption: string;

  @Prop({ type: String, required: false })
  GPS: string;

  @Prop({ type: String, required: false })
  address: string;

  @Prop({ type: String, required: false })
  agentDetails: string;

  @Prop({ type: Date, required: false })
  startTime: Date;

  @Prop({ type: Date, required: false })
  endTime: Date;

  @Prop({ type: String, required: false })
  duration: string;

  @Prop({ type: String, required: false })
  loadProfile: string;

  @Prop({ type: String, required: false })
  shopStatus: string;

  @Prop({ type: String, required: false })
  estimatedFutureLoad: string;

  @Prop({ type: String, required: false })
  agentId: string;

  @Prop({ type: String, required: false })
  category: string;

  @Prop({ type: String, required: false, default: 'pending' })
  status: string;

  @Prop({ type: Object, required: false, default: {} })
  images: Images;

  @Prop({ type: Boolean, required: false, default: false })
  hasPictures: boolean;

  @Prop({ type: String, required: false })
  comment: string;

  @Prop({ type: String, required: false })
  additionalComments: string;

  @Prop({ type: String, required: false })
  signature: string;

  @Prop({ type: Boolean, required: false })
  consent: boolean;

  @Prop({ type: String, required: false })
  generatorSize: string;

  @Prop({ type: [ApplianceSchema], default: [] })
  appliances: any[];

  @Prop({ type: String, required: false })
  collectionFrequency: string;

  @Prop({ type: Boolean })
  GPSCorrected: boolean;

  @Prop({ type: Date })
  GPSUpdatedAt: Date;

  @Prop({ type: Boolean, required: false })
  LGA_Eligibility: boolean;

  @Prop({ type: String, required: false })
  auditor: string;

  @Prop({
    type: Date,
    default: () => startOfSecond(new Date()),
  })
  createdAt: Date;
}

export const surveySchema = SchemaFactory.createForClass(Survey);
