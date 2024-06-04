import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectsCommand,
  ListObjectsCommand,
  ListObjectsCommandInput,
  ObjectIdentifier,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { PutObjectCommandInput } from '@aws-sdk/client-s3/dist-types/commands/PutObjectCommand';

type PutObjectParams = {
  Key: PutObjectCommandInput['Key'];
  Body: PutObjectCommandInput['Body'];
};

type GetObjectsParams = {
  Prefix: ListObjectsCommandInput['Prefix'];
};

type DeleteObjectsParams = {
  Keys: Array<ObjectIdentifier['Key']>;
};

@Injectable()
class S3Service {
  private client: S3Client;
  private readonly bucketName: string;
  private readonly bucketRegion: string;
  private readonly _baseBucketURI: string;

  constructor(private configService: ConfigService) {
    this.bucketName = configService.get('S3_BUCKET_NAME') as string;
    this.bucketRegion = configService.get('S3_BUCKET_REGION') as string;
    this._baseBucketURI = `https://${this.bucketName}.s3.${this.bucketRegion}.amazonaws.com/`;
    this.client = new S3Client({
      region: this.bucketRegion,
    });
  }

  async putObject({ Key, Body }: PutObjectParams) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key,
      Body,
    });
    return this.client.send(command);
  }

  async deleteObjects({ Keys }: DeleteObjectsParams) {
    const command = new DeleteObjectsCommand({
      Bucket: this.bucketName,
      Delete: { Objects: Keys.map((Key) => ({ Key })) },
    });
    return this.client.send(command);
  }

  async listObjects({ Prefix }: GetObjectsParams) {
    const command = new ListObjectsCommand({
      Bucket: this.bucketName,
      Prefix,
    });
    return this.client.send(command);
  }

  get baseBucketURI() {
    return this._baseBucketURI;
  }
}

export default S3Service;
