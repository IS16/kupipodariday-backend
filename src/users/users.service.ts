import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bycrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ServerException } from 'src/exceptions/exception-constructor';
import { ErrorCode } from 'src/exceptions/error-constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hash = await bycrypt.hash(createUserDto.password, 10);

    try {
      return await this.userRepository.save({
        ...createUserDto,
        password: hash,
      });
    } catch (err) {
      if (err.code === '23505') {
        throw new ServerException(ErrorCode.UserAlreadyExist);
      }
    }
  }

  async findById(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }

  async findByUsername(username: string): Promise<User> {
    return await this.userRepository.findOneBy({ username });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOneBy({ email });
  }

  async updateOne(user: User, updateUserDto: UpdateUserDto) {
    let updatedUser = {};

    if (updateUserDto.hasOwnProperty('password')) {
      updatedUser = await bycrypt.hash(updateUserDto.password, 10).then(
        async (hashed) =>
          await this.userRepository.save({
            ...user,
            ...updateUserDto,
            password: hashed,
          }),
      );
    } else {
      updatedUser = await this.userRepository.save({
        ...user,
        ...updateUserDto,
      });
    }

    return updatedUser;
  }

  async findMany(query: string) {
    const users = await this.userRepository.find({
      where: [{ username: Like(`%${query}%`) }, { email: Like(`%${query}%`) }],
    });

    if (!users.length) {
      return [];
    }

    return users;
  }
}
