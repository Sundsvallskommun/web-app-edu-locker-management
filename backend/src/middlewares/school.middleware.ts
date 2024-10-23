import { RequestWithUser } from '@/interfaces/auth.interface';
import { HttpException } from '@exceptions/HttpException';
import { NextFunction, Response } from 'express';

const schoolMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (req?.params?.unitId && req?.user?.schoolUnits.includes(req?.params?.unitId)) {
      next();
    } else {
      next(new HttpException(403, 'Not authorized to access school'));
    }
  } catch (error) {
    next(new HttpException(403, 'Failed to authorize'));
  }
};

export default schoolMiddleware;
