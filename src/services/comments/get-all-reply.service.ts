import { ObjectId } from 'mongodb';
import { ResponseError } from '../../middleware/error.middleware';
import { CommentRepository } from '../../repositories/comment.repository';
import { DocInterface } from '../../entities/docInterface';

export default class GetAllReplyService {
  private commentRepository: CommentRepository;

  constructor(commentRepository: CommentRepository) {
    this.commentRepository = commentRepository;
  }

  public async handle(commentId: string) {
    const pipeline = [
      {
        $match: { _id: new ObjectId(commentId) },
      },
      {
        $lookup: {
          from: 'comments',
          localField: 'reply',
          foreignField: '_id',
          as: 'dataReply',
        },
      },
      { $unwind: '$dataReply' },
      {
        $replaceRoot: { newRoot: '$dataReply' },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $addFields: {
          userInfo: {
            $arrayElemAt: ['$userInfo', 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          postId: 1,
          userId: 1,
          userInfo: {
            _id: 1,
            username: 1,
            photo: 1,
          },
          message: 1,
          replyCount: 1,
          type: 1,
          updatedDate: 1,
          createdDate: 1,
        },
      },
    ];

    const getAllReply = await this.commentRepository.aggregate(pipeline);

    return getAllReply;
  }
}
