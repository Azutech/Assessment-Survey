import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { startOfSecond } from 'date-fns';

import { AgentStatus } from '../enum/enum';

@Schema()
export class Agent extends Document {
  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: String, required: true })
  avatar: string;

  @Prop({ type: Date, required: false })
  lastActiveTime: Date;

  @Prop({ type: String, required: false })
  lastLocation: string;

  @Prop({ type: String, required: false })
  uniqueId: string;

  @Prop({ type: String, required: false, default: 'active' })
  status: string;

  @Prop({ type: Number, required: false, default: 0 })
  totalResponse: number;

  @Prop({ type: String, required: false, default: AgentStatus.ACTIVE })
  userType: string;

  @Prop({ type: String, required: false, default: null })
  supervisorId: string;

  @Prop({ type: String, required: false, default: null })
  supervisorName: string;

  @Prop({ default: () => startOfSecond(new Date()), type: Date })
  createdAt: Date;
}
export const agentSchema = SchemaFactory.createForClass(Agent);