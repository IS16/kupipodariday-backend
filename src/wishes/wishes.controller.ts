import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateWishDto } from './dto/create-wish.dto';
import { WishInterceptor } from 'src/interceptors/wish.interceptor';
import { UpdateWishDto } from './dto/update-wish.dto';

@Controller('wishes')
export class WishesController {
  constructor(private wishesService: WishesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req, @Body() createWishDto: CreateWishDto) {
    return await this.wishesService.create(req.user, createWishDto);
  }

  @UseInterceptors(WishInterceptor)
  @Get('/last')
  async findLastWishes() {
    return await this.wishesService.findLastWishes();
  }

  @UseInterceptors(WishInterceptor)
  @Get('/top')
  async findTopWishes() {
    return await this.wishesService.findTopWishes();
  }

  @UseInterceptors(WishInterceptor)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.wishesService.findOne(Number(id));
  }

  @UseInterceptors(WishInterceptor)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    const userId = req.user.id;
    return await this.wishesService.update(
      Number(id),
      Number(userId),
      updateWishDto,
    );
  }

  @UseInterceptors(WishInterceptor)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return await this.wishesService.remove(Number(id), Number(userId));
  }

  @UseInterceptors(WishInterceptor)
  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  async copyWish(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return await this.wishesService.copyWish(Number(id), Number(userId));
  }
}
