import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

type ExpressResponse = {
  cookie: (name: string, value: string, opts?: object) => void;
  clearCookie: (name: string, opts?: object) => void;
  redirect: (url: string) => void;
};

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getCookieOptions() {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production' ||
      process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    };
  }

  @Post('register')
  async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }
    const result = await this.authService.register(parsed.data);
    res.cookie('access_token', result.accessToken, this.getCookieOptions());
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @Req() req: { user: object },
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = this.authService.loginWithUser(
      req.user as Parameters<typeof this.authService.loginWithUser>[0],
    );
    res.cookie('access_token', result.accessToken, this.getCookieOptions());
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: ExpressResponse) {
    const { maxAge: _, ...clearOptions } = this.getCookieOptions();
    res.clearCookie('access_token', clearOptions);
    return { success: true };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport handles redirect
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: { user: object }, @Res() res: ExpressResponse) {
    const accessToken = this.authService.issueToken(
      req.user as Parameters<typeof this.authService.issueToken>[0],
    );
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: { sub: string; email: string }) {
    return this.authService.getMe(user.sub);
  }
}
