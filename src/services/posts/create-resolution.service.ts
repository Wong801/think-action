import { PostEntity } from '../../entities/posts.entity';
import { PostRepository } from '../../repositories/post.repository';
import { DocInterface } from '../../entities/docInterface';
import { ResponseError } from '../../middleware/error.middleware';
import { UserRepository } from '../../repositories/user.repository';
import { ObjectId } from 'mongodb';

export default class CreateResolutionService {
  private postRepository: PostRepository;

  constructor(postRepository: PostRepository) {
    this.postRepository = postRepository;
  }

  public async handle(data: DocInterface, authUserId: string) {
    const postEntity = new PostEntity({
      userId: new ObjectId(authUserId),
      categoryResolutionId: new ObjectId(),
      type: 'resolutions',
      caption: data.caption,
      photo: data.photo,
      like: [],
      likeCount: 0,
      commentCount: 0,
      dueDate: new Date(data.dueDate),
      updatedDate: data.updatedDate,
      shareWith: data.shareWith,
      isComplete: false,
      isUpdating: false,
      createdDate: new Date(),
    });

    let postData = postEntity.CheckData();

    let post = await this.postRepository.create(postData);

    const dataPost: any = await this.postRepository.readOne(post.insertedId.toString());

    const categoryResolution = {
      _id: dataPost.categoryResolutionId,
      name: data.categoryName,
      resolution: dataPost.caption,
      isComplete: dataPost.isComplete,
      createdDate: dataPost.createdDate,
    };

    const userRepository = new UserRepository();

    await userRepository.updateOne11(authUserId, categoryResolution);

    const userData: any = await userRepository.readOne(authUserId);

    return {
      _id: dataPost._id,
      userId: dataPost.userId,
      categoryResolutionId: dataPost.categoryResolutionId,
      type: dataPost.type,
      caption: dataPost.caption,
      photo: dataPost.photo,
      likeCount: dataPost.likeCount,
      commentCount: dataPost.commentCount,
      dueDate: dataPost.dueDate,
      createdDate: dataPost.createdDate,
      updatedDate: dataPost.updatedDate,
      shareWith: dataPost.shareWith,
      isComplete: dataPost.isComplete,
      userInfo: {
        _id: userData._id,
        username: userData.username,
        photo: userData.photo,
        categoryResolution: userData.categoryResolution,
      },
    };
  }
}