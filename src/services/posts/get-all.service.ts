import { PostRepository } from '../../repositories/post.repository';
import { DocInterface } from '../../entities/docInterface';
import { ObjectId } from 'mongodb';
import GetImageService from '../images/get-image.service';

export default class GetAllPostService {
  private postRepository: PostRepository;

  constructor(postRepository: PostRepository) {
    this.postRepository = postRepository;
  }

  public async handle(authUserId: string, data: DocInterface) {
    const pipeline = [];

  // Conditional $match for userId
  if (data.userId) {
    pipeline.push({ $match: { userId: new ObjectId(data.userId) } });
  }

  // Conditional $match for startDate
  if (data.startDate) {
    pipeline.push({ $match: { createdDate: { $gte: new Date(data.startDate) } } });
  }

  // Conditional $match for endDate
  if (data.endDate) {
    pipeline.push({ $match: { createdDate: { $lte: new Date(data.endDate) } } });
  }

  // Conditional $match for categoryResolutionId
  if (data.categoryResolutionId) {
    pipeline.push({ $match: { categoryResolutionId: new ObjectId(data.categoryResolutionId) } });
  }

  // $lookup stage
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'userInfo',
    },
  });

  // $addFields stage
  pipeline.push({
    $addFields: {
      userInfo: { $arrayElemAt: ['$userInfo', 0] },
      likedByCurrent: new ObjectId(authUserId),
    },
  });

  // $project stage
  pipeline.push({
    $project: {
      _id: 1,
      userId: 1,
      categoryResolutionId: 1,
      type: 1,
      caption: 1,
      photo: 1,
      likeCount: 1,
      likedByCurrent: 1,
      commentCount: 1,
      dueDate: 1,
      createdDate: 1,
      updatedDate: 1,
      shareWith: 1,
      isComplete: 1,
      userInfo: {
        _id: 1,
        username: 1,
        fullname: 1,
        photo: 1,
        resolution: 1,
        categoryResolution: 1,
      },
    },
  });

  // $facet stage
  pipeline.push({
    $facet: {
      metadata: [{ $count: 'totalCount' }],
      data: [
        { $skip: (Number(data.page) - 1) * Number(data.limit) },
        { $limit: Number(data.limit) },
      ],
    },
  });

  // Sorting logic
  if (data.sort && data.order) {
    const sortField = data.sort;
    const sortOrder = data.order === 'asc' ? 1 : -1;
    pipeline.push({ $sort: { [sortField]: sortOrder } });
  } else if (!data.sort && data.order) {
    const sortOrder = data.order === 'asc' ? 1 : -1;
    pipeline.push({ $sort: { createdDate: sortOrder } });
  } else {
    pipeline.push({ $sort: { createdDate: -1 } });
  }

  // Execute the pipeline
  const allPost = await this.postRepository.aggregate(pipeline);

  return {
    total: allPost[0].metadata[0].totalCount,
    page: Number(data.page),
    limit: Number(data.limit),
    data: allPost[0].data,
  };

  }
}
