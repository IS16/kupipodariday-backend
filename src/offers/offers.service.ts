import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createOfferDto: CreateOfferDto, userId: number) {
    const { itemId, hidden, amount } = createOfferDto;
    const user = await this.userRepository.findOneBy({ id: userId });
    const wish = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: ['owner'],
    });

    if (!wish) {
      throw new NotFoundException('Данный подарок не найден');
    }

    if (wish.owner.id === user.id) {
      throw new BadRequestException(
        'Только владелец подарка может им управлять',
      );
    }

    const raised = wish.raised + amount;

    if (raised > wish.price) {
      throw new BadRequestException('Размер подарка слишком большой');
    } else {
      wish.raised = wish.raised + amount;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.insert(Offer, {
        amount,
        hidden,
        user,
      });
      delete user.password;
      await queryRunner.manager.save(wish);
      await queryRunner.commitTransaction();
      return {};
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    try {
      return await this.offerRepository.find({
        relations: ['items'],
      });
    } catch (err) {
      return await this.offerRepository.find({});
    }
  }

  async findOne(id: number) {
    return await this.offerRepository.findOne({
      where: { id },
      relations: { user: true },
    });
  }
}
