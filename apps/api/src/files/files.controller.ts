import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { StorageService } from '../storage/storage.service';

@Controller('files')
export class FilesController {
  constructor(private readonly storageService: StorageService) {}

  @Get()
  async getFile(@Query('key') key: string, @Res() res: Response) {
    if (!key || typeof key !== 'string') {
      throw new BadRequestException('Missing file key');
    }

    const file = await this.storageService.getObject(key);
    if (file.contentType) {
      res.setHeader('Content-Type', file.contentType);
    }
    res.send(file.buffer);
  }
}
