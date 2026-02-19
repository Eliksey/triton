import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateIssueDto {
  @IsString()
  @MinLength(2)
  @MaxLength(140)
  title!: string;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'releaseMonth must be in YYYY-MM format',
  })
  releaseMonth!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
