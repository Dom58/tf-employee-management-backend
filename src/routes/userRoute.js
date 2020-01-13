import express from 'express';
import userController from '../controllers/userController';
import auth from '../middlewares/auth';


const router = express.Router();


router.post('/manager/signup', userController.manager_signup);
router.post('/manager/login', userController.login);
router.get('/all/users', auth, userController.all_users);
router.put('/users/profile/:manager_id', auth, userController.update_profile);
router.post('/manager/forgot-password', userController.forgot_password);
router.post('/manager/reset-password/:token', userController.reset_password);

export default router;
