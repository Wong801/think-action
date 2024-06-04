import { Router } from 'express';
import { verifyUser } from '../../middleware/auth.middleware';
import { PostRepository } from '../../repositories/post.repository';
import CreateResolutionService from '../../services/posts/create-resolution.service';
import PostController from '../../controllers/post.controller';
import CreateWeeklyGoalsService from '../../services/posts/create-weekly-goals.service';
import CreateCompleteGoalsService from '../../services/posts/create-complete-goals.service';
import UpdateResolutionsService from '../../services/posts/update-resolution.service';
import UpdateWeeklyGoalsService from '../../services/posts/update-weekly-goals.service';
import UpdateCompleteGoalsService from '../../services/posts/update-complete-goals.service';
import LikePostService from '../../services/posts/like.service';
import UnlikePostService from '../../services/posts/unlike.service';
import DeletePostService from '../../services/posts/delete.service';
import GetAllPostService from '../../services/posts/get-all.service';
import GetOnePostService from '../../services/posts/get-one.service';
import GetAllLikePostService from '../../services/posts/get-all-like.service';
import GetMonthlyReportService from '../../services/posts/get-monthly-report.service';
import GetYearReportService from '../../services/posts/get-year-report.service';
import multer from 'multer';
import ImageEntity from '../../entities/image.entity';
import GetImageService from '../../services/images/get-image.service';
import GetPerformanceService from '../../services/posts/get-performance.service';

const upload = multer();
const router = Router();

const s3 = new ImageEntity()
const getImage = new GetImageService(s3)

const postRepository = new PostRepository();
const getAllPost = new GetAllPostService(postRepository);
const getOnePost = new GetOnePostService(postRepository);
const getAllLikePost = new GetAllLikePostService(postRepository);
const getPerformanceReport = new GetPerformanceService(postRepository)
const createResolution = new CreateResolutionService(postRepository);
const createWeeklyGoals = new CreateWeeklyGoalsService(postRepository);
const createCompleteGoals = new CreateCompleteGoalsService(postRepository);
const updateResolutions = new UpdateResolutionsService(postRepository);
const updateWeeklyGoals = new UpdateWeeklyGoalsService(postRepository);
const updateCompleteGoals = new UpdateCompleteGoalsService(postRepository);
const likePost = new LikePostService(postRepository);
const unlikePost = new UnlikePostService(postRepository);
const getMonthlyReport = new GetMonthlyReportService(postRepository);
const getYearReport = new GetYearReportService(postRepository);
const deletePost = new DeletePostService(postRepository);
const postController = new PostController(
  getAllPost,
  getOnePost,
  getAllLikePost,
  getPerformanceReport,
  createResolution,
  createWeeklyGoals,
  createCompleteGoals,
  updateResolutions,
  updateWeeklyGoals,
  updateCompleteGoals,
  likePost,
  unlikePost,
  getMonthlyReport,
  getYearReport,
  deletePost,
  getImage
);

router.get('/', verifyUser, (req, res, next) => postController.getAllPost(req, res, next));

router.get('/monthly', verifyUser, (req, res, next) => postController.getMonthlyReport(req, res, next));

router.get('/yearly', verifyUser, (req, res, next) => postController.getYearReport(req, res, next));

router.get('/performance/:userId', verifyUser, (req, res, next) => postController.getPerformanceReport(req, res, next));

router.post('/resolutions', verifyUser, upload.array('photo[]'), (req, res, next) => postController.createResolution(req, res, next));

router.post('/weeklyGoals', verifyUser, upload.array('photo[]'), (req, res, next) => postController.createWeeklyGoals(req, res, next));

router.post('/completeGoals', verifyUser, upload.array('photo[]'), (req, res, next) => postController.createCompleteGoals(req, res, next));

router.post('/like', verifyUser, (req, res, next) => postController.likePost(req, res, next));

router.post('/unlike', verifyUser, (req, res, next) => postController.unlikePost(req, res, next));

router.get('/:id', verifyUser, (req, res, next) => postController.getOnePost(req, res, next));

router.get('/:id/like', verifyUser, (req, res, next) => postController.getAllLikePost(req, res, next));

router.patch('/:id/resolutions', verifyUser, upload.array('photo[]'), (req, res, next) => postController.updateResolutions(req, res, next));

router.patch('/:id/weeklyGoals', verifyUser, upload.array('photo[]'), (req, res, next) => postController.updateWeeklyGoals(req, res, next));

router.patch('/:id/completeGoals', verifyUser, upload.array('photo[]'), (req, res, next) => postController.updateCompleteGoals(req, res, next));

router.delete('/:id', verifyUser, (req, res, next) => postController.deletePost(req, res, next));

export default router;
