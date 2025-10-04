import { HttpException } from '@nestjs/common';
import { code2message, code2status, ErrorCode } from './error-constants';

export class ServerException extends HttpException {
  constructor(code: ErrorCode) {
    super(`${code2message.get(code)}`, Number(code2status.get(code)));
  }
}
