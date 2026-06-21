import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { startOfSecond } from 'date-fns';
import { Document } from 'mongoose';
@Schema()
export class Admin extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  avatar: string;

  @Prop({ type: String, required: false, default: 'admin' })
  userType: string;

  @Prop({ type: String, default: 'active' })
  exportPermission: string;

  @Prop({
    type: Date,
    default: () => startOfSecond(new Date()),
  })
  createdAt: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
