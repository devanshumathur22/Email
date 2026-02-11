import "dotenv/config"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: true, // allow all origins
    credentials: true,
    methods: "GET,POST,PATCH,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })

  const PORT = process.env.PORT || 4000

  // 🔥 VERY IMPORTANT FOR RENDER
  await app.listen(PORT, "0.0.0.0")

  console.log(`🚀 Server running on port ${PORT}`)
}
bootstrap()
