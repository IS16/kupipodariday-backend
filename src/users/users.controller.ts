import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserInterceptor } from 'src/interceptors/user.interceptor';
import { UsersService } from './users.service';
import { WishesService } from 'src/wishes/wishes.service';
import { UpdateUserDto } from './dto/update-user.dto';

@UseInterceptors(UserInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private wishesService: WishesService,
  ) {}

  @Get('me')
  findMe(@Req() req) {
    return req.user;
  }

  @Patch('me')
  update(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateOne(req.user, updateUserDto);
  }

  @Get(':username')
  async findOne(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new Error('Данный пользователь не найден');
    }

    return user;
  }

  @Get('me/wishes')
  async findMeWishes(@Req() req) {
    const userId = req.user.id;
    return await this.wishesService.findUsersWishes(Number(userId));
  }

  @Get(':username/wishes')
  async findUsersWishes(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new Error('Данный пользователь не найден');
    }

    return await this.wishesService.findUsersWishes(user.id);
  }

  @Post('find')
  async findMany(@Body('query') query: string) {
    return await this.usersService.findMany(query);
  }
}
