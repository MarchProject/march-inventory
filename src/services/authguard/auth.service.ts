import { HttpException, Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { logContext } from 'src/common/helpers/log'
import * as common from 'src/types'
import { ThisExpression } from 'ts-morph'
import { JwtService } from '@nestjs/jwt'
import { jwtToken } from './jwt'
import * as bcrypt from 'bcrypt'
// import { InjectRedis, Redis } from '@nestjs-modules/ioredis'
import { uuid } from 'uuidv4'
@Injectable()
export class AuthService implements OnModuleInit {
  private readonly loggers = new Logger(AuthService.name)

  constructor(
    private readonly repos: PrismaService, // private jwtService: JwtService, // @InjectRedis() private readonly redis: Redis,
  ) {}
  onModuleInit() {}

  async createUser(
    username: string,
    password: string,
  ): Promise<common.CreateResponse> {
    const logctx = logContext(AuthService, this.createUser)

    const check = await this.repos.users.findMany({
      where: {
        username,
      },
    })
    if (check.length > 0) {
      throw new HttpException('username already exists', 409)
    }

    const saltRounds = 10

    const hash = await bcrypt.hash(password, saltRounds)

    const result = await this.repos.users.create({
      data: {
        username,
        password: hash,
        role: '1', //ADMIN
        createdBy: 'system',
        updatedBy: 'system',
      },
    })

    this.loggers.debug({ hash }, logctx)
    return result as common.CreateResponse
  }

  async validLogin(username: string, password: string) {
    try {
      const checkLogin = await this.repos.users.findFirst({
        where: {
          username,
        },
        select: {
          id: true,
          username: true,
          password: true,
          groups: {
            select: {
              name: true,
              groupFunctions: {
                select: {
                  functions: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
      this.loggers.debug({ valid: checkLogin }, 'tt')
      if (!checkLogin) {
        throw new HttpException('wrong username or password', 403)
      }
      const checkPassword = await bcrypt.compare(password, checkLogin?.password)

      if (!checkPassword) {
        throw new HttpException('wrong username or password', 403)
      }
      return checkLogin
    } catch (error) {
      throw new HttpException('wrong username or password', 403)
    }
  }

  async login(username: string, password: string): Promise<common.Token> {
    const logctx = logContext(AuthService, this.login)
    try {
      const user = await this.validLogin(username, password)
      this.loggers.debug({ valid: user }, logctx)
      const deviceId = uuid()
      const access_token = jwt.sign(
        {
          role: user.groups.name,
          info: {
            functions: user.groups.groupFunctions.map((e) => e.functions.name),
          },
          deviceId,
          userId: user.id,
          userName: user.username,
        },
        jwtToken.secret,
        {
          expiresIn: '1d',
        },
      )
      const refresh_token = jwt.sign({ id: user.id }, jwtToken.refresh, {
        expiresIn: '7d',
      })
      //save refresh token to user.db
      await this.repos.users.update({
        where: { id: user.id },
        data: {
          deviceId,
          refreshToken: refresh_token,
        },
      })

      this.loggers.debug({ access_token }, logctx)

      return {
        access_token,
        refresh_token,
        userId: user.id,
        username: user.username,
      }
    } catch (error) {
      throw new HttpException('wrong username or password', 403)
    }
  }

  async tokenExpire(refreshToken: string): Promise<common.Token> {
    const logctx = logContext(AuthService, this.tokenExpire)
    try {
      const verifyRefresh = jwt.verify(refreshToken, jwtToken.refresh)
      const { id }: any = jwt.decode(refreshToken)

      // const checkRefresh = await this.repos.users.findUnique({
      //   where: {
      //     id,
      //   },
      //   select: {
      //     refreshToken: true,
      //   },
      // })
      const getDataAccess = await this.repos.users.findUnique({
        where: { id },
        select: {
          role: true,
          id: true,
          username: true,
          refreshToken: true,
          deviceId: true,
          groups: {
            select: {
              name: true,
              groupFunctions: {
                select: {
                  functions: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
      this.loggers.debug({ getDataAccess, verifyRefresh }, logctx)

      if (getDataAccess.refreshToken !== refreshToken) {
        throw new HttpException('Unauthorized', 401)
      }
      //check user.db db.refreshtoken === refreshToken ? else logout
      //add check user deleted?
      const access_token = jwt.sign(
        {
          role: getDataAccess.groups.name,
          info: {
            functions: getDataAccess.groups.groupFunctions.map(
              (e) => e.functions.name,
            ),
          },
          deviceId: getDataAccess.deviceId,
          userId: getDataAccess.id,
          username: getDataAccess.username,
        },
        jwtToken.secret,
        {
          expiresIn: '1d',
        },
      )
      this.loggers.debug({ refreshToken, verifyRefresh, id }, logctx)

      // await this.repos.users.update({
      //   where: { id: getDataAccess.id },
      //   data: {
      //     deviceId,
      //   },
      // })
      return { access_token }
    } catch (error) {
      throw new HttpException('Unauthorized', 401)
    }
  }

  async signOut(
    userId: string,
    access_token: string,
  ): Promise<common.SignOutResponse> {
    const logctx = logContext(AuthService, this.signOut)
    try {
      //TODO set blacklist refreshToken redis
      const decode: any = jwt.decode(access_token)
      // const tokenExpire = decode?.exp
      // const token_key = `bl_${access_token}`
      // await this.redis.set(token_key, access_token)
      // await this.redis.expireat(token_key, tokenExpire)
      const deleteRefresh = await this.repos.users.update({
        where: {
          id: userId,
        },
        data: {
          refreshToken: null,
          deviceId: null,
        },
        select: {
          id: true,
        },
      })
      this.loggers.debug({ deleteRefresh, decode }, logctx)
      return {
        id: deleteRefresh.id,
      }
    } catch (error) {
      throw new HttpException('Internal Server Error', 500)
    }
  }

  async getDiviceId(userId: string): Promise<String> {
    try {
      const { deviceId } = await this.repos.users.findUnique({
        where: {
          id: userId,
        },
        select: {
          deviceId: true,
        },
      })
      return deviceId
    } catch (error) {
      throw new HttpException('Internal Server Error', 500)
    }
  }

  async testRedis(): Promise<String> {
    // await this.redis.set('key', 'Redis data!')
    // const redisData = await this.redis.get('key')
    // await this.redisService.getRedis()
    // this.redis.expireat()
    return (Math.floor(new Date().getTime() / 1000.0) + 30).toString()
  }

  async verifyAccessToken(
    token: string,
  ): Promise<common.VerifyAccessTokenResponse> {
    const logctx = logContext(AuthService, this.verifyAccessToken)
    try {
      const verify = jwt.verify(token, jwtToken.secret)
      this.loggers.debug({ verify }, 'verify success', logctx)
      return {
        success: true,
      }
    } catch (error) {
      this.loggers.debug({ error }, 'verify failed', logctx)
      return {
        success: false,
      }
    }
  }
}
