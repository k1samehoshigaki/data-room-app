import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.getOrThrow<string>('SUPABASE_BUCKET_NAME');
    this.client = new S3Client({
      endpoint: config.getOrThrow<string>('SUPABASE_S3_ENDPOINT'),
      region: config.get<string>('SUPABASE_S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: config.getOrThrow<string>('SUPABASE_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow<string>('SUPABASE_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });
  }

  generateStorageKey(fileName: string): string {
    const ext = fileName.includes('.') ? fileName.split('.').pop() : '';
    return ext ? `files/${uuidv4()}.${ext}` : `files/${uuidv4()}`;
  }

  async getPresignedUploadUrl(
    storageKey: string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn: 600 });
  }

  async getPresignedDownloadUrl(storageKey: string, fileName?: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ...(fileName
        ? { ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fileName)}"` }
        : {}),
    });
    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  async deleteObject(storageKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
    });
    await this.client.send(command);
  }
}
