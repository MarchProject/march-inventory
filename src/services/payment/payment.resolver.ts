import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql'
import { Inject, Logger, UseGuards } from '@nestjs/common'
import { logContext } from 'src/common/helpers/log'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { PaymentService } from './payment.service'
import { AuthGuard } from '@nestjs/passport'
import * as common from 'src/types'
// import { UserAuthGuard } from '../authguard/auth.guard'
import { uamAuthRole } from '../authguard/uam'
import { UserAuthGuard } from '@march/core'
// import { AuthService } from './auth.service';

@Resolver(() => common.Payment)
export class PaymentResolver {
  private readonly loggers = new Logger(PaymentResolver.name)

  constructor() {}
  @Inject(PaymentService) private paymentService: PaymentService // @Inject(InvoiceService) private invoiceService: InvoiceService

  @UseGuards(new UserAuthGuard(uamAuthRole.Admin))
  @Query(() => [common.Payment], { name: 'getPaymentList' })
  async getPaymentList(@Args('id') id: string): Promise<common.Payment[]> {
    const logctx = logContext(PaymentResolver, this.getPaymentList)
    const user = 'name'
    this.loggers.debug({ user }, logctx)
    const payments = await this.paymentService.getPaymentList(id)
    return payments
  }

  @Mutation(() => String, { name: 'payCreditCard' })
  async payCreditCard(
    @Args('params') req: common.PayCreditCardRequest,
  ): Promise<String> {
    const logctx = logContext(PaymentResolver, this.payCreditCard)
    const result = await this.paymentService.payCreditCard(req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @Mutation(() => String, { name: 'payPromptPay' })
  async payPromptPay(@Args('id') id: string): Promise<String> {
    const logctx = logContext(PaymentResolver, this.getPaymentList)
    const user = 'name'
    this.loggers.debug({ user }, logctx)
    const result = await this.paymentService.payPromptPay(id)
    return result
  }

  @Mutation(() => common.Payment, { name: 'editPayment' })
  async editPayment(
    @Args('id') id: string,
    @Args('amount') amount: number,
    @Args('name') name: string,
    @Args('lastDay') lastDay: string,
    @Args('types') types: string,
  ): Promise<common.Payment> {
    const logctx = logContext(PaymentResolver, this.getPaymentList)
    const user = 'name'
    this.loggers.debug({ user }, logctx)
    const result = await this.paymentService.editPayment(
      id,
      amount,
      name,
      lastDay,
      types,
    )
    return result
  }
}
