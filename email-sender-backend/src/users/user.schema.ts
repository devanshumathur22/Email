import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  // Encrypted SMTP config
  @Prop()
  smtpHost: string

  @Prop()
  smtpPort: number

  @Prop()
  smtpUser: string

  @Prop()
  smtpPass: string

  @Prop({ default: false })
  smtpVerified: boolean

  @Prop({
  type: {
    host: String,
    port: Number,
    user: String,
    pass: String,
    secure: Boolean,
    verified: Boolean,
    addedAt: Date,
  },
})
smtp?: {
  host: string
  port: number
  user: string
  pass: string
  secure: boolean
  verified: { type: Boolean, default: false }
  addedAt: Date
}

}

export const UserSchema = SchemaFactory.createForClass(User)
