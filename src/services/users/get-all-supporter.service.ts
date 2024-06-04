import { UserRepository } from '../../repositories/user.repository';
import { ObjectId } from 'mongodb';

export default class GetAllSupporterService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async handle(id: string, authUserId: string, page: number, limit: number, username: string) {
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: { _id: new ObjectId(id), username: { $regex: username } } },
      { $unwind: '$supporter' },
      
      { $addFields: { isAuthenticatedUser: { $eq: [new ObjectId(authUserId), '$_id'] } } },
      {
        $lookup: {
          from: 'users',
          localField: 'supporter',
          foreignField: '_id',
          as: 'supporterDetails',
        },
      },
      { $unwind: '$supporterDetails' },
      {
        $addFields: {
          'supporterDetails.isSupporting': {
            $in: [new ObjectId(authUserId), '$supporterDetails.supporter'],
          },
        },
      },
      {
        $replaceRoot: { newRoot: '$supporterDetails' },
      },
      {
        $project: {
          fullname: 1,
          username: 1,
          email: 1,
          bio: 1,
          photo: 1,
          categoryResolution: 1,
          isPublic: 1,
          supporterCount: 1,
          supportingCount: 1,
          isSupporting: 1,
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'totalCount' }],
          data: [
            { $skip: +skip },
            { $limit: +limit },
          ]
        }
      }
    ];

    const result = await this.userRepository.aggregate(pipeline);

    return {
      total: result[0].metadata[0].totalCount,
      page,
      limit,
      data: result[0].data.map((supporter: Record<string, any>) => ({
        ...supporter,
        isAuthenticatedUser: supporter._id.equals(new ObjectId(authUserId)),
      }))
    };
  }
}
