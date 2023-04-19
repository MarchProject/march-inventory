import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql'
import { Inject, Logger, UseGuards, Request } from '@nestjs/common'
import { logContext } from 'src/common/helpers/log'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { AuthGuard } from '@nestjs/passport'
import * as common from 'src/types'
import { AuthService } from './auth.service'
import { uamAuthRole } from './uam'
import { UserAuthGuard } from '@march/core'
// import { UserAuthGuard } from '@march/core'
// import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  private readonly loggers = new Logger(AuthResolver.name)

  constructor() {}
  @Inject(AuthService) private authService: AuthService
  // @InjectRedis() private readonly redis: Redis

  // @UseGuards(GqlAuthGuard)
  // @Query(() => [common.Payment], { name: 'getPaymentList' })
  // async getPaymentList(@Args('id') id: string): Promise<common.Payment[]> {
  //   const logctx = logContext(AuthResolver, this.getPaymentList)
  //   const user = 'name'
  //   this.loggers.debug({ user }, logctx)
  //   const payments = await this.authService.getPaymentList(id)
  //   return payments
  // }

  @Mutation(() => common.Token, { name: 'signIn' })
  async signIn(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<common.Token> {
    const logctx = logContext(AuthResolver, this.signIn)
    const user = 'name'
    this.loggers.debug({ user, username }, logctx)

    return await this.authService.login(username, password)
  }

  @Mutation(() => common.Token, { name: 'tokenExpire' })
  async tokenExpire(
    @Args('refreshToken') refreshToken: string,
  ): Promise<common.Token> {
    const logctx = logContext(AuthResolver, this.tokenExpire)

    this.loggers.debug({}, logctx)

    return await this.authService.tokenExpire(refreshToken)
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Mutation(() => common.CreateResponse, { name: 'createUser' })
  async createUser(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<common.CreateResponse> {
    const logctx = logContext(AuthResolver, this.createUser)
    const user = 'name'
    this.loggers.debug({ user, username }, logctx)
    const result = await this.authService.createUser(username, password)
    return result
  }

  @Mutation(() => String, { name: 'redis' })
  async TestRedis(@Args('test') test: string): Promise<String> {
    const logctx = logContext(AuthResolver, this.TestRedis)
    const user = 'hi'
    // await this.redis.set('key2', 'Redis data!')
    this.loggers.debug({ test }, logctx)

    return await this.authService.testRedis()
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Mutation(() => String, { name: 'signOut' })
  async signOut(
    @Args('id') id: string,
    @Context('request') req,
  ): Promise<common.SignOutResponse> {
    const logctx = logContext(AuthResolver, this.signOut)
    //set blacklist refreshToken redis
    const access_token = req.headers.authorization
    this.loggers.debug({ id, access_token }, logctx)

    return await this.authService.signOut(id, access_token)
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Mutation(() => String, { name: 'verifyAccessToken' })
  async verifyAccessToken(
    @Args('token') token: string,
  ): Promise<common.VerifyAccessTokenResponse> {
    const logctx = logContext(AuthResolver, this.verifyAccessToken)

    this.loggers.debug({ token }, logctx)

    return await this.authService.verifyAccessToken(token)
  }
}
