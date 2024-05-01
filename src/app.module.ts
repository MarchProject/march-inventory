import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ServicesModule } from './services/services.module'
import { RedisModule } from '@nestjs-modules/ioredis'
import { ScheduleModule } from '@nestjs/schedule'
import {
  AcceptLanguageResolver,
  CookieResolver,
  GraphQLWebsocketResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n'
import * as path from 'path'
import { ApiConfigService } from './common/i18n/api.service'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    GraphQLModule.forRoot({
      typePaths: ['**/*.graphql'],
      installSubscriptionHandlers: true,
      introspection: process.env.GRAPHQL_INTROSPECTION === 'true' || false,
      debug: process.env.GRAPHQL_DEBUG === 'true' || false,
      playground: {
        endpoint: '/graphql',
        subscriptionEndpoint: '/graphql',
        cdnUrl: 'https://cdn.jsdelivr.net/npm',
      },
      context: ({ req }) => ({ request: req }),

      // formatError: process.env.GRAPHQL_FORMAT_ERROR === 'true' ? gqlErrorFilter : undefined,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '../../src/i18n/'),
        watch: true,
      },
      typesOutputPath: path.join(
        __dirname,
        '../../src/generated/i18n.generated.ts',
      ),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),
    // RedisModule.forRoot({
    //   config: {
    //     url: 'redis://0.0.0.0:6379',
    //     password: 'mypassword',
    //   },
    // }),
    ServicesModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
