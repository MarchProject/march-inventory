import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  private getString(key: string): string {
    const value = this.get(key)

    return value.replace(/\\n/g, '\n')
  }

  get fallbackLanguage(): string {
    return this.getString('FALLBACK_LANGUAGE').toLowerCase()
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development'
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV')
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key)

    return value
  }
}
