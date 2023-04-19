import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { PaymentController } from './payment.controller'
import { PaymentResolver } from './payment.resolver'
import { PaymentService } from './payment.service'

@Module({
  imports: [HttpModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentResolver, PrismaService],
  //   exports: [AuthService],
})
export class PaymentModule {}
