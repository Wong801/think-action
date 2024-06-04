import { NextFunction, Request, Response } from 'express';
import CreateCommentService from '../services/comments/create.service';
import CreateReplyCommentService from '../services/comments/create-reply.service';
import UpdateCommentService from '../services/comments/update.service';
import DeleteCommentService from '../services/comments/delete.service';
import GetAllCommentService from '../services/comments/get-all.service';
import GetAllReplyService from '../services/comments/get-all-reply.service';
import dotenv from 'dotenv';
import GetImageService from '../services/images/get-image.service';
import { userInfo } from 'os';

dotenv.config();

export default class CommentController {
  private createCommentService: CreateCommentService;
  private createReplyCommentService: CreateReplyCommentService;
  private updateCommentService: UpdateCommentService;
  private deleteCommentService: DeleteCommentService;
  private getAllCommentService: GetAllCommentService;
  private getAllReplyService: GetAllReplyService;
  private getImageService: GetImageService

  constructor(
    getAllCommentService: GetAllCommentService,
    getAllReplyService: GetAllReplyService,
    createCommentService: CreateCommentService,
    createReplyCommentService: CreateReplyCommentService,
    updateCommentService: UpdateCommentService,
    deleteCommentService: DeleteCommentService,
    getImageService: GetImageService
  ) {
    this.createCommentService = createCommentService;
    this.createReplyCommentService = createReplyCommentService;
    this.updateCommentService = updateCommentService;
    this.deleteCommentService = deleteCommentService;
    this.getAllCommentService = getAllCommentService;
    this.getAllReplyService = getAllReplyService;
    this.getImageService = getImageService
  }

  public async getAllComment(req: any, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;

      const result = await this.getAllCommentService.handle(postId);

      const mapped = await Promise.all(result.map(async (comment) => ({
        ...comment,
        userInfo: {
          ...comment.userInfo,
          photo: comment.userInfo.photo = await this.getImageService.handle(comment.userInfo.photo)
        }
      })))

      return res.status(200).json({ status: 'success', data: mapped });
    } catch (e) {
      next(e);
    }
  }

  public async getAllReply(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await this.getAllReplyService.handle(id);

      const mapped = await Promise.all(result.map(async (comment) => ({
        ...comment,
        userInfo: {
          ...comment.userInfo,
          photo: comment.userInfo.photo = await this.getImageService.handle(comment.userInfo.photo)
        }
      })))

      return res.status(200).json({ status: 'success', replyCount: result.length, data: mapped });
    } catch (e) {
      next(e);
    }
  }

  public async createComment(req: any, res: Response, next: NextFunction) {
    try {
      const authUserId = req.userData._id;

      const result = await this.createCommentService.handle(req.body, authUserId);

      return res.status(200).json({ status: 'success', data: result });
    } catch (e) {
      next(e);
    }
  }

  public async createReplyComment(req: any, res: Response, next: NextFunction) {
    try {
      const authUserId = req.userData._id;

      const result = await this.createReplyCommentService.handle(req.body, authUserId);

      return res.status(200).json({ status: 'success', data: result });
    } catch (e) {
      next(e);
    }
  }

  public async updateComment(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authUserId = req.userData._id;

      const result = await this.updateCommentService.handle(req.body, id, authUserId);

      return res.status(200).json({ status: 'success', data: result });
    } catch (e) {
      next(e);
    }
  }

  public async deleteComment(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authUserId = req.userData._id;

      const result = await this.deleteCommentService.handle(id, authUserId);

      return res.status(200).json({});
    } catch (e) {
      next(e);
    }
  }
}
