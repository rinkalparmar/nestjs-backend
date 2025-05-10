import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, minlength: 2, maxlength: 30 })
  yourName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  userName?: string;

  @Prop()
  PresentAddress?: string;

  @Prop()
  PermanentAddress?: string;

  @Prop()
  city?: string;

  @Prop()
  postalCode?: number;

  @Prop()
  country?: string;

  @Prop({
    match: [/^\d{10}$/, 'Mobile number must be exactly 10 digits'],
  })
  mobile?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
