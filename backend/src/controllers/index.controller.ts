import { Public } from '@middlewares/global-auth';
import { Controller, Get } from 'routing-controllers';

@Controller()
export class IndexController {
  @Public('Service root - returns a static literal, reads nothing and reveals nothing about the municipality or its users')
  @Get('/')
  index() {
    return 'OK';
  }
}
