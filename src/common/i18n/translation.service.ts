import { Inject, Injectable } from '@nestjs/common'
import { PathImpl2 } from '@nestjs/config'
import { REQUEST } from '@nestjs/core'
import { I18n, I18nContext, I18nService, TranslateOptions } from 'nestjs-i18n'
import { Request } from 'express'
import { CONTEXT } from '@nestjs/microservices'
import { I18nTranslations } from 'src/generated/i18n.generated'
// import { I18nTranslations } from '../generated/i18n.generated.ts';

@Injectable()
export class TranslationService {
  constructor(
    @Inject(CONTEXT) private readonly context,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async translate(
    key: PathImpl2<I18nTranslations>,
    options: TranslateOptions = {},
  ): Promise<string> {
    const { headers } = this.context.req
    const LangHeader = headers['lang']
    return await this.i18n.translate(key, { lang: LangHeader })
  }
}
