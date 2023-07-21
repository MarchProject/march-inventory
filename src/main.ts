import { NestFactory } from '@nestjs/core'
import { json, urlencoded } from 'express'
import { AppModule } from './app.module'
import { GrpcOptions, Transport } from '@nestjs/microservices'
import {
  ConfigService,
  inventoryGrpcPackageName,
  inventoryProtoPath,
} from '@march/core'
// import {} from '../../../proto/inventory/index.proto'
// import { ConfigService } from '@march/core'
// import { graphqlUploadExpress } from 'graphql-upload'

const config = ConfigService.load()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const grpcUrl = `0.0.0.0:${config.inventory.grpc.port}`
  const grpcServer = app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      url: grpcUrl,
      package: [inventoryGrpcPackageName],
      protoPath: [inventoryProtoPath],
    },
  })
  console.log({ grpcServer })
  await grpcServer.listen()

  app.use(json({ limit: '50mb' }))
  app.use(urlencoded({ extended: true, limit: '50mb' }))
  // app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))
  app.enableCors()

  await app.listen(config.inventory.rest.port)
  console.log(`Application is running on: ${await app.getUrl()}`)
  const url = `http://0.0.0.0:${config.inventory.rest.port}/graphql`
  console.log(url)
}
bootstrap()
