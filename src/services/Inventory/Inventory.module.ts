import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'

import { InventoryResolver } from './Inventory.resolver'
import { InventoryService } from './Inventory.service'
import { InventoryGrpcService } from './inventoryGrpc.service'
import { TranslationService } from 'src/common/i18n/translation.service'

@Module({
  imports: [HttpModule],
  providers: [
    InventoryService,
    InventoryResolver,
    PrismaService,
    TranslationService,
  ],
  controllers: [InventoryGrpcService],
})
export class InventoryModule {}
