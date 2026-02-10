import "dotenv/config"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

app.enableCors({
  origin: true,   // 🔥 reflect request origin automatically
  credentials: true,
})



  const PORT = process.env.PORT || 8000
  await app.listen(PORT)

  console.log(`🚀 Backend running on port ${PORT}`)
}
bootstrap()
