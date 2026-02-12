import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { JwtAuthGuard } from "../auth/jwt.guard"
import { EmailQueueService } from "./email-queue.service"

/* ✅ SAFE FILE TYPE (Render + TS compatible) */
type UploadedFileType = {
  buffer: Buffer
  originalname: string
  mimetype: string
  size: number
}

@UseGuards(JwtAuthGuard)
@Controller("email-queue")
export class EmailQueueController {
  constructor(
    private readonly queueService: EmailQueueService,
  ) {}

  /* ================= LIST ================= */
  @Get()
  async findAll(@Req() req) {
    return this.queueService.findAll(req.user.id)
  }

  /* ================= COUNT ================= */
  @Get("count")
  async count(@Req() req) {
    return this.queueService.count(req.user.id)
  }

  /* ================= CSV UPLOAD ================= */
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadCSV(
    @Req() req,
    @UploadedFile() file: UploadedFileType,
    @Query("mode") mode: "append" | "replace" = "append",
  ) {
    if (!file) {
      throw new BadRequestException("CSV file required")
    }

    return this.queueService.processCSV(
      req.user.id,
      file,
      mode,
    )
  }

  /* ================= UPDATE ================= */
  @Patch(":id")
  async update(
    @Req() req,
    @Param("id") id: string,
    @Body() body: {
      subject?: string
      html?: string
      footer?: string
    },
  ) {
    return this.queueService.update(
      req.user.id,
      id,
      body,
    )
  }

  /* ================= QUEUE → CAMPAIGN ================= */
  @Post("convert-to-campaign")
  async convertToCampaign(
    @Req() req,
    @Body("queueIds") queueIds: string[],
  ) {
    if (!Array.isArray(queueIds) || !queueIds.length) {
      throw new BadRequestException("No emails selected")
    }

    return this.queueService.convertToCampaign(
      req.user.id,
      queueIds,
    )
  }

  /* ================= DELETE ONE ================= */
  @Delete(":id")
  async deleteOne(
    @Req() req,
    @Param("id") id: string,
  ) {
    return this.queueService.deleteOne(
      req.user.id,
      id,
    )
  }

  /* ================= DELETE MANY ================= */
  @Post("delete-many")
  async deleteMany(
    @Req() req,
    @Body("ids") ids: string[],
  ) {
    if (!Array.isArray(ids) || !ids.length) {
      throw new BadRequestException("No ids provided")
    }

    return this.queueService.deleteMany(
      req.user.id,
      ids,
    )
  }

  /* ================= DELETE ALL ================= */
  @Delete()
  async deleteAll(@Req() req) {
    return this.queueService.deleteAll(req.user.id)
  }

  
}
