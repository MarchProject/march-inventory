import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export interface ICurrentUser {
  shopsId: string
  userId: string
  userName: string
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): ICurrentUser => {
    const ctx = GqlExecutionContext.create(context)
    return {
      shopsId: ctx.getContext().req.shopsId,
      userId: ctx.getContext().req.userId,
      userName: ctx.getContext().req.userName,
    }
  },
)
