import { ObjectId } from 'mongodb';
import { ResponseError2 } from '../middleware/error.middleware';

export interface PostInterface {
  _id?: string | ObjectId;
  userId: string | ObjectId;
  categoryResolutionId: string | ObjectId;
  type: 'resolutions' | 'weeklyGoals' | 'completeGoals';
  caption: string;
  photo?: Array<string>;
  like?: Array<string> | string;
  likeCount?: number;
  commentCount?: number;
  dueDate?: Date | string;
  updatedDate?: Date | string;
  shareWith: 'everyone' | 'supporter' | 'private';
  weeklyGoalId?: string | ObjectId;
  isComplete?: boolean;
  isUpdating: boolean;
  createdDate: Date;
}

export class PostEntity {
  private post: PostInterface;

  constructor(post: PostInterface) {
    this.post = {
      _id: post._id,
      userId: post.userId,
      categoryResolutionId: post.categoryResolutionId,
      type: post.type,
      caption: post.caption,
      photo: post.photo,
      like: post.like,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      dueDate: post.dueDate,
      updatedDate: post.updatedDate,
      shareWith: post.shareWith,
      weeklyGoalId: post.weeklyGoalId,
      isComplete: post.isComplete,
      isUpdating: post.isUpdating || false,
      createdDate: post.createdDate,
    };
  }

  CheckData() {
    const errors: { [key: string]: string } = {};

    if (!this.post.type) {
      errors.type = 'Post type is required.';
    } else if (!['resolutions', 'weeklyGoals', 'completeGoals'].includes(this.post.type)) {
      errors.type = 'Post type must be either "resolutions", "weeklyGoals" or "completeGoals".';
    }

    if (this.post.type === 'resolutions' && !this.post.categoryResolutionId) {
      errors.categoryResolutionId = 'Category resolution id is required for resolutions.';
    }

    if (!this.post.caption) {
      errors.caption = 'Enter a caption';
    }

    if (this.post.photo && !Array.isArray(this.post.photo)) {
      errors.like = 'Photo must be an array.';
    }

    if (this.post.like && !Array.isArray(this.post.like)) {
      errors.like = 'Likes must be an array.';
    }

    if (this.post.commentCount && typeof this.post.commentCount !== 'number') {
      errors.commentCount = 'Comment count must be a number.';
    }

    if (this.post.likeCount && typeof this.post.likeCount !== 'number') {
      errors.likeCount = 'Like count must be a number.';
    }

    if (this.post.dueDate && (!(this.post.dueDate instanceof Date) && typeof this.post.dueDate !== 'string')) {
      errors.dueDate = 'Due date must be a Date object.';
    }

    if (this.post.updatedDate && (!(this.post.updatedDate instanceof Date) && typeof this.post.updatedDate !== 'string')) {
      errors.updatedDate = 'Updated date must be a Date object.';
    }

    if (this.post.shareWith === undefined) {
      errors.shareWith = 'Choose a visibilty';
    } else if (!['everyone', 'supporter', 'private'].includes(this.post.shareWith)) {
      errors.shareWith = 'Share with must be either "everyone", "supporter", or "private".';
    }

    if (this.post.isComplete !== undefined && typeof this.post.isComplete !== 'boolean') {
      errors.isComplete = 'isComplete must be a boolean value.';
    }

    if (this.post.isUpdating && typeof this.post.isUpdating !== 'boolean') {
      errors.isUpdating = 'isUpdating must be a boolean value.';
    }

    if (Object.keys(errors).length > 0) {
      throw new ResponseError2(400, JSON.stringify(errors));
    }

    return {
      _id: this.post._id,
      userId: this.post.userId,
      categoryResolutionId: this.post.categoryResolutionId,
      type: this.post.type,
      caption: this.post.caption,
      photo: this.post.photo,
      like: this.post.like,
      likeCount: this.post.likeCount,
      commentCount: this.post.commentCount,
      dueDate: this.post.dueDate,
      updatedDate: this.post.updatedDate,
      shareWith: this.post.shareWith,
      weeklyGoalId: this.post.weeklyGoalId,
      isComplete: this.post.isComplete,
      isUpdating: this.post.isUpdating,
      createdDate: this.post.createdDate,
    };
  }
}
