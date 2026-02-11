import "dotenv/config"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

 app.enableCors({
  origin: "https://email-ap8g.vercel.app",  // exact frontend URL
  credentials: true,
  methods: "GET,POST,PATCH,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
})


  const PORT = process.env.PORT || 8000

await app.listen(PORT, "0.0.0.0")

console.log(`🚀 Server running on port ${PORT}`)

}
bootstrap()
