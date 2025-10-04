import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(user: User, createWishDto: CreateWishDto) {
    const wish = await this.wishRepository.save({
      ...createWishDto,
      owner: user,
    });

    delete user.password;
    return wish;
  }

  async findUsersWishes(id: number) {
    return await this.wishRepository.find({
      where: { owner: { id } },
    });
  }

  async findLastWishes() {
    return await this.wishRepository.find({
      relations: { owner: true, offers: true },
      order: { createdAt: 'DESC' },
      take: 40,
    });
  }

  async findTopWishes() {
    return await this.wishRepository.find({
      relations: { owner: true, offers: true },
      order: { copied: 'DESC' },
      take: 20,
    });
  }

  async findOne(id: number) {
    return await this.wishRepository.findOne({
      where: { id },
      relations: { owner: true, offers: true },
    });
  }

  async update(id: number, userId: number, updateWishDto: UpdateWishDto) {
    const candidate = await this.findOne(id);

    if (!candidate) {
      throw new Error('Данный подарок не найден');
    }

    if (candidate.offers.length > 0) {
      throw new BadRequestException('Подарок уже был предложен');
    }

    if (candidate.owner.id !== userId) {
      throw new Error('Пользователь не предлагал данный подарок');
    }

    return await this.wishRepository.save({
      id,
      ...updateWishDto,
    });
  }

  async remove(id: number, userId: number) {
    const candidate = await this.findOne(id);

    if (!candidate) {
      throw new Error('Данный подарок не найден');
    }

    if (candidate.owner.id !== userId) {
      throw new Error('Пользователь не предлагал данный подарок');
    }

    await this.wishRepository.delete({ id });
    return {};
  }

  async copyWish(wishId: number, userId: number) {
    const origWish = await this.wishRepository.findOneBy({ id: wishId });

    if (!origWish) {
      throw new Error('Данный подарок не найден');
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new Error('Данный пользователь не найден');
    }

    const wishData: CreateWishDto = {
      name: origWish.name,
      description: origWish.description,
      link: origWish.link,
      image: origWish.image,
      price: origWish.price,
    };

    origWish.copied += 1;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.insert(Wish, {
        ...wishData,
        owner: user,
      });
      delete user.password;
      await queryRunner.manager.save(origWish);
      await queryRunner.commitTransaction();
      return {};
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
  }
}
