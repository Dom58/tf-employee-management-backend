import express from 'express';
import userController from '../controllers/userController';
import SignupValidation from '../middlewares/userValidation';
import isAuth from '../middlewares/auth';


const router = express.Router();


router.post('/manager/signup', userController.manager_signup);
router.post('/manager/login', userController.login);

export default router;
