import { CookieOptions, NextFunction, Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { ResponseError } from '../middleware/error.middleware';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default class AuthController {
  private userRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await this.userRepository.getUserByEmail(email.toLowerCase());

      if (!user) {
        throw new ResponseError(401, 'Email not found');
      }

      if (!(await bcrypt.compare(password, user.password))) {
        throw new ResponseError(401, 'Password is wrong');
      }

      const payload = {
        _id: user._id,
        username: user.username,
        email: user.email,
      };

      const secret = process.env.JWT_SECRET!;

      const token = jwt.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES,
      });

      const cookieOptions: CookieOptions = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        domain: '.wong801.my.id'
      };

      return res.cookie('jwt-token', token, cookieOptions).status(200).json({
        status: 'success',
        token: token,
        data: {
          user: {
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            bio: user.bio,
            supporterCount: user.supporterCount,
            supportingCount: user.supportingCount,
            photo: user.photo,
            categoryResolution: user.categoryResolution,
            isPublic: user.isPublic,
          },
        },
      });
    } catch (e) {
      next(e);
    }
  }

  public async logout(req: Request, res: Response) {
    try {
      return res.clearCookie('jwt-token').status(200).json({ status: 'success', message: 'Successfully logged out.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
