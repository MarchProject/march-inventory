import { Module } from '@nestjs/common'
import { AuthModule } from './authguard/auth.module'
import { PaymentModule } from './payment/payment.module'
import { InventoryModule } from './Inventory/Inventory.module'

@Module({
  imports: [PaymentModule, AuthModule, InventoryModule],
})
export class ServicesModule {}
