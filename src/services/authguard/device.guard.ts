import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'
import { ignoreElements, Observable } from 'rxjs'
import * as jwt from 'jsonwebtoken'
import { logContext } from 'src/common/helpers/log'
import { jwtToken } from './jwt'
import { uamAuthRole } from './uam'
import axios from 'axios'
// import * as Redis from 'ioredis'

export interface GraphQlEndpoint {
  endpointType?: string
  endpoint?: string
  className?: string
  method?: string
}

function getRequestHeader(request: any, key: string) {
  if (typeof request?.get === 'function') {
    return request?.get(key)
  }
  return request?.[key] || request?.headers?.[key]
}

@Injectable()
export class DiviceGuard extends AuthGuard('jwt') {
  private readonly loggers = new Logger(DiviceGuard.name)

  constructor(
    private readonly role?: string, // private readonly options?: UamAuthGuardOptions,
  ) {
    super()
  }

  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest()
  }

  getGraphQLEndpointContext(context: ExecutionContext): GraphQlEndpoint {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context)
      const info = gqlContext.getInfo()
      const { fieldName } = info
      const endpointType = info.parentType.name
      const className = gqlContext.getClass().name
      const endpoint = `${endpointType} ${className}:${fieldName}`
      const endpointContext = {
        endpointType,
        endpoint,
        className,
        method: fieldName,
      }
      return endpointContext
    }
    return {}
  }

  canActivate(context: ExecutionContext) {
    const logctx = logContext(DiviceGuard, this.canActivate)
    const graphQlEndpoint = this.getGraphQLEndpointContext(context)
    // this.loggers.debug({ graphQlEndpoint: graphQlEndpoint.endpoint }, logctx)
    const request = this.getRequest(context)

    const authorizationHeader = getRequestHeader(request, 'Authorization')

    if (!authorizationHeader) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }

    const accessToken = authorizationHeader.replace('Bearer ', '')

    try {
      const jwtVerifyResultDivice: any = jwt.verify(
        accessToken,
        jwtToken.secret,
      )
      this.loggers.debug(
        { jwtVerifyResultDivice: jwtVerifyResultDivice.deviceId },
        logctx,
      )
      request.userId = jwtVerifyResultDivice.userId
      return jwtVerifyResultDivice.deviceId
    } catch (error) {
      this.loggers.error({ error }, logctx)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }
  }
}
