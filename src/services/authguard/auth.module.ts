import { Module } from '@nestjs/common'
import { AuthResolver } from './auth.resolver'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { AuthService } from './auth.service'
import { UserAuthGuard } from './auth.guard'
import { AuthController } from './auth.controller'
import { DiviceGuard } from './device.guard'
@Module({
  // imports: [
  //   RedisModule.forRoot({
  //     config: {
  //       url: 'redis://0.0.0.0:6379',
  //       password: 'mypassword',
  //     },
  //   }),
  // ],
  // imports: [
  //   PassportModule.register({ defaultStrategy: 'jwt' }),
  //   JwtModule.register({
  //     secret: jwtToken.secret,
  //     signOptions: { expiresIn: '3600' },
  //   }),
  // ],
  // imports: [UserAuthGuard],
  controllers: [AuthController],
  providers: [
    AuthResolver,
    PrismaService,
    AuthService,
    UserAuthGuard,
    DiviceGuard,
  ],
})
export class AuthModule {}
