import "dotenv/config"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: [
      "http://localhost:5173",          // local frontend
      "https://email-ap8g.vercel.app", // 🔥 vercel frontend
    ],
    methods: "GET,POST,PATCH,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })

  const PORT = process.env.PORT || 8000
  await app.listen(PORT)

  console.log(`🚀 Backend running on port ${PORT}`)
}
bootstrap()
