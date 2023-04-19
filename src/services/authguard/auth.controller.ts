import { Controller, Get, UseGuards, Request } from '@nestjs/common'
import { AuthService } from './auth.service'
import { DiviceGuard } from './device.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(DiviceGuard)
  @Get('diviceId')
  async getDiviceId(@Request() req): Promise<String> {
    console.log({ req: req?.userId })
    const userId = req?.userId
    return await this.authService.getDiviceId(userId)
  }
}
