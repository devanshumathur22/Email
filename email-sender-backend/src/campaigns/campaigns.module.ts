import { Module, forwardRef } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"

import { Campaign, CampaignSchema } from "./campaign.schema"
import {
  CampaignRecipient,
  CampaignRecipientSchema,
} from "./campaign-recipient.schema"

import { CampaignsController } from "./campaigns.controller"
import { CampaignsService } from "./campaigns.service"
import { CampaignsCron } from "./campaigns.cron"

import { EmailModule } from "../email/email.module"
import { EmailQueueModule } from "../email-queue/email-queue.module"

import { Contact, ContactSchema } from "../contacts/contact.schema"
import { Group, GroupSchema } from "../group/groups.schema"
import { EmailQueue, EmailQueueSchema } from "../email-queue/email-queue.schema"
import {
  Unsubscribe,
  UnsubscribeSchema,
} from "../email/unsubscribe.schema"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: CampaignRecipient.name, schema: CampaignRecipientSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: Group.name, schema: GroupSchema },
      { name: EmailQueue.name, schema: EmailQueueSchema },
      { name: Unsubscribe.name, schema: UnsubscribeSchema },
    ]),
    forwardRef(() => EmailQueueModule),
    EmailModule,
  ],

  controllers: [CampaignsController],

  providers: [
    CampaignsService,
    CampaignsCron, // ✅ ONLY ONE CRON (FINAL)
  ],

  exports: [CampaignsService],
})
export class CampaignsModule {}
