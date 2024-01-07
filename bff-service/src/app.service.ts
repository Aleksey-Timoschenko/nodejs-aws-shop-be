import {
  BadGatewayException,
  Inject,
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse, isAxiosError } from 'axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import 'dotenv/config';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async callParticularService(
    request: Request,
    serviceName: string,
  ): Promise<AxiosResponse> {
    const serviceUrl = process.env[serviceName];

    if (!serviceUrl) {
      throw new BadGatewayException('Cannot process request');
    }

    const { method, headers, body, originalUrl } = request;
    const servicePath = originalUrl.replace(`/${serviceName}`, '');
    const needToUseCache = method === 'GET' && servicePath === '/products';

    if (needToUseCache) {
      const cache = await this.cacheManager.get<AxiosResponse>('products');

      if (cache) {
        return cache;
      }
    }

    try {
      const response = await this.httpService.request({
        url: `${serviceUrl}${servicePath}`,
        method,
        headers: headers.authorization
          ? { Authorization: headers.authorization }
          : undefined,
        data: body ?? undefined,
      });
      const result = firstValueFrom(response);

      if (needToUseCache) {
        await this.cacheManager.set('products', await result, 120000);
      }

      return result;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new HttpException(error.message, error.status);
      }

      throw new InternalServerErrorException();
    }
  }
}
