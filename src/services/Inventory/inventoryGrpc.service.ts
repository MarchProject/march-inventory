import { Controller, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { inventory } from 'src/types/grpc/proto/inventory'

@Injectable()
@Controller()
export class InventoryGrpcService implements OnModuleInit {
  private readonly loggers = new Logger(InventoryGrpcService.name)

  constructor(private readonly repos: PrismaService) {}
  onModuleInit() {}

  @GrpcMethod(InventoryGrpcService.name, 'tester')
  // @UseGuards(GrpcAuthGuard)
  async tester(): Promise<inventory.InventoryNameList> {
    console.log('grpc pas2s')
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
