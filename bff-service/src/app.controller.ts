import { All, Controller, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @All(['/:serviceName', '/:serviceName/*'])
  async processRequest(
    @Req() request: Request,
    @Res() response: Response,
    @Param('serviceName') serviceName: string,
  ) {
    const result = await this.appService.callParticularService(
      request,
      serviceName,
    );

    return response.set(result.headers).status(result.status).send(result.data);
  }
}
