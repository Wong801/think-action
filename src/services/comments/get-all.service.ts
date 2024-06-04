import { ObjectId } from 'mongodb';
import { ResponseError } from '../../middleware/error.middleware';
import { CommentRepository } from '../../repositories/comment.repository';
import { DocInterface } from '../../entities/docInterface';

export default class GetAllCommentService {
  private commentRepository: CommentRepository;

  constructor(commentRepository: CommentRepository) {
    this.commentRepository = commentRepository;
  }

  public async handle(postId: string) {
    const pipeline = [
      {
        $match: { postId: new ObjectId(postId) },
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

    const getAllComment = await this.commentRepository.aggregate(pipeline);

    return getAllComment;
  }
}
