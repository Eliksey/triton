import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket: string;
  private readonly apiPublicUrl: string;
  private readonly s3Client: S3Client;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('S3_BUCKET', 'triton');
    this.apiPublicUrl = this.config.get<string>(
      'API_PUBLIC_URL',
      'http://localhost:4000',
    );

    this.s3Client = new S3Client({
      region: this.config.get<string>('S3_REGION', 'us-east-1'),
      endpoint: this.config.get<string>('S3_ENDPOINT', 'http://localhost:9000'),
      forcePathStyle:
        this.config.get<string>('S3_FORCE_PATH_STYLE', 'true') !== 'false',
      credentials: {
        accessKeyId: this.config.get<string>('S3_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: this.config.get<string>('S3_SECRET_KEY', 'minioadmin'),
      },
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  getObjectPublicUrl(key: string): string {
    return `${this.apiPublicUrl}/api/files?key=${encodeURIComponent(key)}`;
  }

  async uploadObject(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: params.key,
          Body: params.body,
          ContentType: params.contentType,
        }),
      );
    } catch (error) {
      this.logger.error('Failed to upload object', error as Error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.warn(
        `Failed to delete object ${key}: ${(error as Error).message}`,
      );
    }
  }

  async getObject(
    key: string,
  ): Promise<{ buffer: Buffer; contentType: string | undefined }> {
    try {
      const result = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      const buffer = await this.bodyToBuffer(result.Body);
      return {
        buffer,
        contentType: result.ContentType,
      };
    } catch (error) {
      const message = (error as Error).message || '';
      if (message.includes('NoSuchKey') || message.includes('not found')) {
        throw new NotFoundException('File not found');
      }
      this.logger.warn(`Failed to fetch object ${key}: ${message}`);
      throw new InternalServerErrorException('Failed to read file');
    }
  }

  private async ensureBucket() {
    try {
      await this.s3Client.send(
        new HeadBucketCommand({
          Bucket: this.bucket,
        }),
      );
    } catch {
      await this.s3Client.send(
        new CreateBucketCommand({
          Bucket: this.bucket,
        }),
      );
      this.logger.log(`Created S3 bucket "${this.bucket}"`);
    }
  }

  private async bodyToBuffer(body: unknown): Promise<Buffer> {
    if (!body) {
      return Buffer.alloc(0);
    }

    const awsBody = body as {
      transformToByteArray?: () => Promise<Uint8Array>;
    };
    if (typeof awsBody.transformToByteArray === 'function') {
      const bytes = await awsBody.transformToByteArray();
      return Buffer.from(bytes);
    }

    if (body instanceof Readable) {
      const chunks: Buffer[] = [];
      for await (const chunk of body) {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
          continue;
        }
        if (chunk instanceof Uint8Array) {
          chunks.push(Buffer.from(chunk));
          continue;
        }
        if (typeof chunk === 'string') {
          chunks.push(Buffer.from(chunk));
          continue;
        }
        throw new InternalServerErrorException('Unsupported stream chunk type');
      }
      return Buffer.concat(chunks);
    }

    throw new InternalServerErrorException('Unsupported object stream');
  }
}
