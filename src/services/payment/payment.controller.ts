import { Controller, Get, UseGuards, Request, Post } from '@nestjs/common'
import { PaymentService } from './payment.service'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  async getDiviceId(@Request() req): Promise<String> {
    console.log({ req: req?.body })

    return ''
  }
}
