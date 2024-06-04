import { NextFunction, Request, Response } from 'express';
import CreateUserService from '../services/users/create.service';
import UpdateMyPasswordUserService from '../services/users/update-my-password.service';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import GetOneUserService from '../services/users/get-one.service';
import GetAllSupporterService from '../services/users/get-all-supporter.service';
import GetAllSupportingService from '../services/users/get-all-supporting.service';
import GetCurrentUserRequestService from '../services/users/get-current-user-request.service';
import GetCurrentUserNotificationService from '../services/users/get-current-user-notification.service';
import UpdateCurrentUserService from '../services/users/update-current-user.service';
import SupportAnotherUserService from '../services/users/support-another.service';
import UnsupportAnotherUserService from '../services/users/unsupport-another.service';
import AcceptSupportRequestService from '../services/users/accept-support-request.service';
import RejectSupportRequestService from '../services/users/reject-support-request.service';
import SearchUserService from '../services/users/search.service';
import GetHistoryService from '../services/users/get-history.service';
import DeleteHistoryService from '../services/users/delete-history.service';
import GetImageService from '../services/images/get-image.service';

dotenv.config();

export default class UserController {
  private createUserService: CreateUserService;
  private updateMyPasswordUserService: UpdateMyPasswordUserService;
  private getOneUserService: GetOneUserService;
  private getAllSupporterService: GetAllSupporterService;
  private getAllSupportingService: GetAllSupportingService;
  private getCurrentUserRequestService: GetCurrentUserRequestService;
  private getCurrentUserNotificationService: GetCurrentUserNotificationService;
  private updateCurrentUserService: UpdateCurrentUserService;
  private supportAnotherUserService: SupportAnotherUserService;
  private unsupportAnotherUserService: UnsupportAnotherUserService;
  private acceptSupportRequestService: AcceptSupportRequestService;
  private rejectSupportRequestService: RejectSupportRequestService;
  private searchUserService: SearchUserService;
  private getHistoryService: GetHistoryService;
  private deleteHistoryService: DeleteHistoryService;
  private getImageService: GetImageService

  constructor(
    createUserService: CreateUserService,
    updateMyPasswordUserService: UpdateMyPasswordUserService,
    getOneUserService: GetOneUserService,
    getAllSupporterService: GetAllSupporterService,
    getAllSupportingService: GetAllSupportingService,
    getCurrentUserRequestService: GetCurrentUserRequestService,
    getCurrentUserNotificationService: GetCurrentUserNotificationService,
    updateCurrentUserService: UpdateCurrentUserService,
    supportAnotherUserService: SupportAnotherUserService,
    unsupportAnotherUserService: UnsupportAnotherUserService,
    acceptSupportRequestService: AcceptSupportRequestService,
    rejectSupportRequestService: RejectSupportRequestService,
    searchUserService: SearchUserService,
    getHistoryService: GetHistoryService,
    deleteHistoryService: DeleteHistoryService,
    getImageService: GetImageService
  ) {
    this.createUserService = createUserService;
    this.updateMyPasswordUserService = updateMyPasswordUserService;
    this.getOneUserService = getOneUserService;
    this.getAllSupporterService = getAllSupporterService;
    this.getAllSupportingService = getAllSupportingService;
    this.getCurrentUserRequestService = getCurrentUserRequestService;
    this.getCurrentUserNotificationService = getCurrentUserNotificationService;
    this.updateCurrentUserService = updateCurrentUserService;
    this.supportAnotherUserService = supportAnotherUserService;
    this.unsupportAnotherUserService = unsupportAnotherUserService;
    this.acceptSupportRequestService = acceptSupportRequestService;
    this.rejectSupportRequestService = rejectSupportRequestService;
    this.searchUserService = searchUserService;
    this.getHistoryService = getHistoryService;
    this.deleteHistoryService = deleteHistoryService;
    this.getImageService = getImageService
  }

  public async getAuthUser (req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(req.userData)
    } catch (e) {
      next(e)
    }
  }

  public async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const result = await this.createUserService.handle(data);

      const payload = {
        _id: result._id,
        username: result.username,
        email: result.email,
      };

      const secret = process.env.JWT_SECRET!;

      const token = jwt.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES,
      });

      const cookieOptions = {
        expiresIn: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.cookie('jwt-token', token, cookieOptions).status(200).json({ status: 'success', token: token, data: { user: result } });
    } catch (e) {
      next(e);
    }
  }

  public async updateMyPassword(req: any, res: Response, next: NextFunction) {
    try {
      const id = req.userData._id;

      const result = await this.updateMyPasswordUserService.handle(id, req.body);

      const payload = {
        _id: result._id,
        username: result.username,
        email: result.email,
      };

      const secret = process.env.JWT_SECRET!;

      const token = jwt.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES,
      });

      const cookieOptions = {
        expiresIn: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.status(200).json({ status: 'success', token: token, data: { user: result } });
    } catch (e) {
      next(e);
    }
  }

  public async getOneUser(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authUserId = req.userData._id;

      const result = await this.getOneUserService.handle(id, authUserId);

      result.photo = await this.getImageService.handle(result.photo)

      return res.status(200).json({ status: 'success', data: result });
    } catch (e) {
      next(e);
    }
  }

  public async getAllSupporter(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authUserId = req.userData._id;
      const { page, limit, username } = req.query;

      const result = await this.getAllSupporterService.handle(id, authUserId, page, limit, username || '');

      return res.status(200).json({ 
        status: 'success', 
        results: result.total, 
        limit: result.limit, 
        page: result.page, 
        data: await Promise.all(result.data.map(async (i: any) => ({
          ...i,
          photo: await this.getImageService.handle(i.photo)
        })))
      });
    } catch (e) {
      next(e);
    }
  }

  public async getAllSupporting(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authUserId = req.userData._id;
      const { page, limit, username } = req.query;

      const result = await this.getAllSupportingService.handle(id, authUserId, page, limit, username || '');

      return res.status(200).json({ status: 'success', limit, page, results: result.length, data: result });
    } catch (e) {
      next(e);
    }
  }

  public async getCurrentUserRequest(req: any, res: Response, next: NextFunction) {
    try {
      const authUserId = req.userData._id;
      const { page, limit } = req.body;

      const result = await this.getCurrentUserRequestService.handle(authUserId, page, limit);

      return res.status(200).json({ status: 'success', limit: +limit, page: +page, results: result.length, data: result });
    } catch (e) {
      next(e);
    }
  }

  public async getCurrentUserNotification(req: any, res: Response, next: NextFunction) {
    try {
      const authUserId = req.userData._id;

      const result = await this.getCurrentUserNotificationService.handle(authUserId);

      let totalLength = 0;

      for (let key in result) {
        if (Array.isArray(result[key])) {
          totalLength += result[key].length;
        }
      }

      return res.status(200).json({ status: 'success', limit: 20, results: totalLength, data: result });
    } catch (e) {
      next(e);
    }
  }

  public async updateCurrentUser(req: any, res: Response, next: NextFunction) {
    try {
      const id = req.userData._id;
      const data = req.body;

      let result = await this.updateCurrentUserService.handle(id, data);

      result.photo = await this.getImageService.handle(result.photo)

      return res.status(200).json({ status: 'success', data: result });
    } catch (e) {
      next(e);
    }
  }

  public async supportAnotherUser(req: any, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const authUserId = req.userData._id;

      const result: any = await this.supportAnotherUserService.handle(userId, authUserId);

      return res.status(200).json({ status: 'success', message: result.isPublic ? 'User is now supported' : 'Support request sent successfully', data: result });
    } catch (e) {
      next(e);
    }
  }

  public async unsupportAnotherUser(req: any, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const authUserId = req.userData._id;

      const result: any = await this.unsupportAnotherUserService.handle(userId, authUserId);

      return res.status(200).json({ status: 'success', message: 'User is now unsupported', data: result });
    } catch (e) {
      next(e);
    }
  }

  public async acceptSupportRequest(req: any, res: Response, next: NextFunction) {
    try {
      const { userId, notificationId } = req.body;
      const authUserId = req.userData._id;

      const result: any = await this.acceptSupportRequestService.handle(userId, authUserId, notificationId);

      return res.status(200).json({ status: 'success', message: 'Support request accepted successfully', data: result });
    } catch (e) {
      next(e);
    }
  }

  public async rejectSupportRequest(req: any, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const authUserId = req.userData._id;

      const result: any = await this.rejectSupportRequestService.handle(userId, authUserId);

      return res.status(200).json({ status: 'success', message: 'Support request rejected successfully', data: result });
    } catch (e) {
      next(e);
    }
  }

  public async searchUser(req: any, res: Response, next: NextFunction) {
    try {
      const { username } = req.query;
      const authUserId = req.userData._id;

      const result: any = await this.searchUserService.handle(username, authUserId);

      return res.status(200).json({ status: 'success', results: result.length, data: result });
    } catch (e) {
      next(e);
    }
  }

  public async getHistory(req: any, res: Response, next: NextFunction) {
    try {
      const authUserId = req.userData._id;

      const result: any = await this.getHistoryService.handle(authUserId);

      return res.status(200).json({ status: 'success', results: result.length, data: result });
    } catch (e) {
      next(e);
    }
  }

  public async deleteHistory(req: any, res: Response, next: NextFunction) {
    try {
      const authUserId = req.userData._id;

      await this.deleteHistoryService.handle(authUserId);

      return res.status(204).json({});
    } catch (e) {
      next(e);
    }
  }
}
