import { Injectable, OnModuleInit } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { createHash } from 'crypto'
import { HttpService } from '@nestjs/axios'
import { logContext } from 'src/common/helpers/log'
import { url } from 'inspector'
import { firstValueFrom } from 'rxjs'
import * as common from 'src/types'
import axios, { AxiosError, AxiosResponse } from 'axios'
@Injectable()
export class PaymentService implements OnModuleInit {
  private readonly loggers = new Logger(PaymentService.name)

  constructor(
    // private readonly httpService: HttpService,
    private readonly repos: PrismaService,
  ) {}
  onModuleInit() {}
  async getPaymentList(id: string): Promise<common.Payment[]> {
    const logctx = logContext(PaymentService, this.getPaymentList)

    const result = await this.repos.payments.findMany()

    this.loggers.debug({}, logctx)
    return result as common.Payment[]
  }

  async payCreditCard(req: common.PayCreditCardRequest): Promise<String> {
    const logctx = logContext(PaymentService, this.payCreditCard)
    const { description, amount, currency, return_uri, card } = req
    const _data = {
      description,
      amount,
      currency,
      return_uri,
      card,
    }
    try {
      const { data, status, statusText }: AxiosResponse = await axios.post(
        'https://api.omise.co/charges',
        _data,
        {
          auth: {
            username: process.env.SECRET_KEY,
            password: null,
          },
        },
      )
      this.loggers.debug({ data, status, statusText }, logctx)

      return 'result as common.Payment'
    } catch (error) {
      console.log(error.response.data)
    }
  }

  async payPromptPay(id: string): Promise<String> {
    const logctx = logContext(PaymentService, this.payPromptPay)
    // this.loggers.debug({ _date }, logctx)
    const _data = {
      amount: 600000,
      currency: 'thb',
      'source[type]': 'promptpay',
    }
    const datas = JSON.stringify(_data)
    console.log({ datas })
    try {
      const { data, status, statusText }: AxiosResponse = await axios.post(
        'https://api.omise.co/charges',
        `amount=${_data.amount}&currency=THB&source[type]=promptpay&metadata[email]=black@gmail.com`,
        {
          auth: {
            username: process.env.SECRET_KEY,
            password: null,
          },
        },
      )
      this.loggers.debug({ data, status, statusText }, logctx)

      return 'result as common.Payment.promptpay'
    } catch (error) {
      console.log(error.response.data)
    }
  }

  async editPayment(
    id: string,
    amount: number,
    name: string,
    lastDay: string,
    types: string,
  ): Promise<common.Payment> {
    const _date = new Date(lastDay)
    // this.loggers.debug({ _date }, logctx)
    const _types = common.PaymentTypes[types]
    const result = await this.repos.payments.update({
      where: {
        id,
      },
      data: {
        amount,
        name,
        lastDay: _date,
        types: _types,
      },
    })
    return result as common.Payment
  }
}
