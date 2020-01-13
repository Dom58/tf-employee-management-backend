import express from 'express';
import employeeController from '../controllers/employeeController';
import auth from '../middlewares/auth';


const router = express.Router();


router.post('/employees', auth, employeeController.create_employee);
router.delete('/employees/:id', auth, employeeController.delete_employee);
router.put('/employees/:id', auth, employeeController.update_employee);
router.put('/employees/:id/activate', auth, employeeController.activate_employee);
router.put('/employees/:id/suspend',auth, employeeController.suspend_employee);
router.post('/employees/search',auth, employeeController.search);

router.get('/all/employees',auth, employeeController.all_employees);


export default router;
