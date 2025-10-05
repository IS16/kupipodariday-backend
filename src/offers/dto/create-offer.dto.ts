import { IsBoolean, IsInt } from 'class-validator';

export class CreateOfferDto {
  @IsInt()
  amount: number;

  @IsInt()
  itemId: number;

  @IsBoolean()
  hidden: boolean;
}
