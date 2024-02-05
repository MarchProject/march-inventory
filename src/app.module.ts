import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ServicesModule } from './services/services.module'
import { RedisModule } from '@nestjs-modules/ioredis'
import { ScheduleModule } from '@nestjs/schedule'
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
