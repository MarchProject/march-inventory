import { Metadata } from '@grpc/grpc-js'
import { GrpcAuthGuard } from '@march/core'
import {
  Controller,
  Injectable,
  Logger,
  OnModuleInit,
  UseGuards,
} from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { inventory } from 'src/types/grpc/proto/inventory'
// import { GrpcAuthGuard } from './grpc.guard'

@Injectable()
@Controller()
export class InventoryGrpcService implements OnModuleInit {
  private readonly loggers = new Logger(InventoryGrpcService.name)

  constructor(private readonly repos: PrismaService) {}
  onModuleInit() {}

  @UseGuards(GrpcAuthGuard)
  @GrpcMethod(InventoryGrpcService.name, 'tester')
  async tester(data, metadata: Metadata): Promise<inventory.InventoryNameList> {
    console.log('grpc pas2s', { metadata: metadata.getMap() })
    return {
      inventoryName: [
        {
          id: '123',
          name: '123',
        },
        { 
          id: '1234',
          name: '1234',
        },
      ],
    }
  }
}
