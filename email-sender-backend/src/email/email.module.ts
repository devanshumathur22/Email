import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { EmailController } from "./email.controller"
import { EmailService } from "./email.service"
import { Campaign, CampaignSchema } from "../campaigns/campaign.schema"
import { Unsubscribe, UnsubscribeSchema } from "./unsubscribe.schema"
import { UsersModule } from "src/users/users.module"
@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: Unsubscribe.name, schema: UnsubscribeSchema },
    ]),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
