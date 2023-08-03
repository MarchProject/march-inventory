import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  createParamDecorator,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { isNil } from 'lodash'

export interface ICurrentUser {
  shopsId: string
  userId: string
  userName: string
  tasks: string[]
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): ICurrentUser => {
    const ctx = GqlExecutionContext.create(context)
    if (
      isNil(ctx.getContext().req.shopsId === undefined) ||
      isNil(ctx.getContext().req.userName)
    ) {
      throw new HttpException('Unauthorized ShopId', HttpStatus.UNAUTHORIZED)
    }
    return {
      shopsId: ctx.getContext().req.shopsId,
      userId: ctx.getContext().req.userId,
      userName: ctx.getContext().req.userName,
      tasks: ctx.getContext().req.taskServices,
    }
  },
)
