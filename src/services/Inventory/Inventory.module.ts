import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'

import { InventoryResolver } from './Inventory.resolver'
import { InventoryService } from './Inventory.service'

@Module({
  imports: [HttpModule],
  providers: [InventoryService, InventoryResolver, PrismaService],
})
export class InventoryModule {}
