import { NestFactory } from '@nestjs/core'
import { json, urlencoded } from 'express'
import { AppModule } from './app.module'
// import { graphqlUploadExpress } from 'graphql-upload'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(json({ limit: '50mb' }))
  app.use(urlencoded({ extended: true, limit: '50mb' }))
  // app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))
  const port = 3002
  app.enableCors()

  await app.listen(port)
  console.log(await app.getUrl())
  const url = `http://0.0.0.0:${port}/graphql`
  console.log(url)
}
bootstrap()
