import { PostRepository } from '../../repositories/post.repository';
import { DocInterface } from '../../entities/docInterface';
import { ObjectId } from 'mongodb';

export default class GetPerformanceService {
  private postRepository: PostRepository;

  constructor(postRepository: PostRepository) {
    this.postRepository = postRepository;
  }

  public async handle(userId: string) {
    const pipelineAll = [];

    pipelineAll.push({ $match: { userId: new ObjectId(userId) } });

    // $project stage
    pipelineAll.push({
      $project: {
        _id: 1
      },
    });

    const pipelineComplete = []

    pipelineComplete.push({
      $match: {
        userId: new ObjectId(userId),
        isComplete: true
      }
    })

    // $project stage
    pipelineComplete.push({
      $project: {
        _id: 1
      },
    });

    const allPost = (await this.postRepository.aggregate(pipelineAll)).length;
    const completedPost = (await this.postRepository.aggregate(pipelineComplete)).length;

    return (completedPost / allPost) * 100

  }
}
