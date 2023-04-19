import { Module } from '@nestjs/common'
import { InventoryModule } from './Inventory/Inventory.module'

@Module({
  imports: [InventoryModule],
})
export class ServicesModule {}
