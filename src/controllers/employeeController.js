import dotenv from 'dotenv';
import sGmail from '@sendgrid/mail';
import model from '../db/models/index';
import {
    createEmployeeValidator, 
    updateEmployeeValidator, 
    activateEmployeeValidator,
    suspandEmployeeValidator
} from '../middlewares/employeeValidation';
import search from '../helpers/search';

dotenv.config();

const { User, Employee } = model;

/**
 * employee controller
 */

class EmployeeManager {
    /**
     *
     * @param {Object} req
     * @param {Object} res
     * @returns {Object} Employee object
     */
    
    static async create_employee(req, res) { 

        if (req.user.position !== 'manager') {
            return res.status(401).json({ error: 'Access Denied. Only manager can access this route' });
        }

        const {email, name, national_id, phone_number,position, status, date_birth} = req.body;

        if(phone_number.length != 9 || (phone_number.substr(0, 2)!= '78' && phone_number.substr(0, 2)!= '73' && phone_number.substr(0, 2)!= '72') ){
            return res.status(400).json({errors: `Phone number ## ${phone_number} ## must be 9 digits and starts with 78...,73...,72,..`});
        }

        if(national_id.substr(0, 2)!== '11' && national_id.substr(0, 2)!== '12'){
            return res.status(400).json({errors: `NID must starts with 11... or 12...`});
        }

        const checkAge = national_id.slice(1,5);

        const thisYear = 2020;
        if(thisYear-checkAge < 18){
            return res.status(400).json({errors: `You cant record an employee of under-eighteen!`});
        }

        const errors = createEmployeeValidator(req.body);
        if (errors) {
            return res.status(400).json({errors});
        } 
        try { 
            const sendCongrats = async(email,name,position) =>  {
                const message = {
                  to: email,
                  from: 'smart.managers@gmail.com',
                  Subject: `Hello ${email}`,
                  text: 'SmartManagers Ltd is pleasure to have an Employee like you!',
                  html: `<p>Dear ${name} , <br />
                  Congrats, Thank you very much for joining our company as a <b>${position}</b>.
                  <br />
                  SmartManagers Ltd is very pleasure to have an Employee like you.
                  </p>
                  <br />
                  <p>Best Regards, <b>SmartManagers</b></p>
              ` 
                };
                sGmail.setApiKey(process.env.SENDGRID_API_KEY);
                await sGmail.send(message);
            };

            const new_phone = '250'+phone_number;

            const findEmployee = await Employee.findOne({where: {email}});
            const findNid = await Employee.findOne({where: {national_id}});
            const findPhone = await Employee.findOne({where: {phone_number: new_phone}});

            if(findEmployee) {
             return res.status(409).json({errors: 'Employee email already recorded!'});
            }
            
            if(findPhone) {
                return res.status(409).json({errors: 'Phone number already recoded, Please enter a new Pnumber!'});
            }

            if(findNid) {
                return res.status(409).json({errors: 'National id already recoded, Please enter a new one!'});
            }

            const employeeData = await Employee.create({
                name,
                national_id,
                phone_number: '+250'+phone_number,
                email,
                status: status || "inactive",
                date_birth,
                position,
                userId: req.user.id
            });

            //  Send email verification to user email account
            await sendCongrats(email,name,position);

            return res.status(201).json(
                {message: 'Manager created successfully',
                   data: {
                        name,
                        id: employeeData.dataValues.id,
                        national_id: employeeData.dataValues.national_id,
                        phone_number: employeeData.dataValues.phone_number,
                        email: employeeData.dataValues.email,
                        date_birth: employeeData.dataValues.date_birth,
                        status: employeeData.dataValues.status,
                        position: employeeData.dataValues.position
                }
            });

        } catch(error) {
            console.log(error)
            return res.status(500).json({ error});
            }

        }

        static async delete_employee(req, res) { 

            if (req.user.position !== 'manager') {
                return res.status(401).json({ error: 'Access Denied. Only manager can access this route' });
            }
    
            const { id } = req.params;
            const convertedId = parseInt(id)
            try { 
                const findEmployee = await Employee.findOne({where: {id: convertedId}});
                if(!findEmployee) {
                    return res.status(404).json({ error: `Employee with id #${id}# not found!` });
                }
                await Employee.destroy({ where: { id } });
                return res.status(200).json({ message: `Employee record successfully deleted!` });

            } catch(error){
                return res.status(500).json({ error: 'Internal Server Error, Please try again' });
            }
        }
        
        static async update_employee(req, res) { 
            
            if (req.user.position !== 'manager') {
                return res.status(401).json({ error: 'Access Denied. Only manager can access this route' });
            }

            const {name,national_id,phone_number,date_birth,email,position} = req.body
            const { id } = req.params;
            const convertedId = parseInt(id)
            
            const errors = updateEmployeeValidator(req.body);
            if (errors) {
                return res.status(400).json({errors});
            } 

            try { 

                const findEmployee = await Employee.findOne({where: {id: convertedId}});
                if(!findEmployee) {
                    return res.status(404).json({ error: `Employee with id #${id}# not found!` });
                }

                const updateInfo={
                    name: name ||findEmployee.dataValues.name,
                    national_id: national_id||findEmployee.dataValues.national_id,
                    phone_number: phone_number || findEmployee.dataValues.phone_number,
                    date_birth: date_birth || findEmployee.dataValues.date_birth,
                    email: email || findEmployee.dataValues.email,
                    position: position || findEmployee.dataValues.position,
                }
                    
                    await Employee.update(updateInfo,{where:{id: findEmployee.id}});
                    const updatedEmployee = await Employee.findOne({where:{id: findEmployee.id}});

                    return res.status(200).json({ 
                        message:"Employee Info Updated Successfully!",
                        data: updatedEmployee.dataValues
                    })

            } catch(error){
                console.log("====Error====", error)
                return res.status(500).json({ error: 'Internal Server Error, Please try again' });
            }
        }

        static async all_employees(req, res) { 

            if (req.user.position !== 'manager') {
                return res.status(401).json({ error: 'Access Denied. Only manager can access this route' });
            }

            try {
                const employees=await Employee.findAll({
                    order: [['updatedAt', 'DESC']],
                });

                if (!employees[0]) {
                    return res.status(404).json({
                        message: "No employee created yet"
                    })
                }
                
                return res.status(200).json({
                    data: employees
                });

            } catch(error){
                return res.status(500).json({ error: 'Internal Server Error, Please try again' });
            }

        }

        static async activate_employee(req, res){

            if (req.user.position !== 'manager') {
                return res.status(401).json({ error: 'Access Denied. Only manager can access this route' });
            }
    
            const {id} = req.params;
            const {status} = req.body;

            const convertedId = parseInt(id);

            const errors = activateEmployeeValidator(req.body);
                if (errors) {
                    return res.status(400).json({errors});
                }

            try {

                const findEmployee = await Employee.findOne({where: {id: convertedId}});

                if(!findEmployee) {
                    return res.status(404).json({ error: `Employee with id #${id}# not found!` });
                }

                if(findEmployee.status === "active") {
                    return res.status(400).json({ error: `Employee is already activated!` });
                }

                const updateInfo = {
                    status
                }

                await Employee.update(updateInfo,{where:{id: findEmployee.id}});
                const updatedEmployee = await Employee.findOne({where:{id: findEmployee.id}});
                
                return res.status(200).json({ 
                    message:"Employee record activated Successfully!",
                    data: updatedEmployee.dataValues
                })

            } catch(error){
                return res.status(500).json({ error: 'Internal Server Error, Please try again' });
            }
        }  

        static async suspend_employee(req, res){
            
            if (req.user.position !== 'manager') {
                return res.status(401).json({ error: 'Access Denied. Only manager can access this route' });
            }
    
            const {id} = req.params;
            const {status} = req.body;
    
            const convertedId = parseInt(id);
    
            const errors = suspandEmployeeValidator(req.body);
                if (errors) {
                    return res.status(400).json({errors});
                }
    
            try {
    
                const findEmployee = await Employee.findOne({where: {id: convertedId}});
    
                if(!findEmployee) {
                    return res.status(404).json({ error: `Employee with id #${id}# not found!` });
                }
    
                const updateInfo = {
                    status: status
                }
    
                await Employee.update(updateInfo,{where:{id: findEmployee.id}});
                const updatedEmployee = await Employee.findOne({where:{id: findEmployee.id}});
                
                return res.status(200).json({ 
                    message:"Employee record suspended Successfully!",
                    data: updatedEmployee.dataValues
                })
    
            } catch(error){
                return res.status(500).json({ error: 'Internal Server Error, Please try again' });
            }
        }


        static async search(req, res){
            
            if (req.user.position !== 'manager') {
                return res.status(401).json({ error: 'Access Denied. Only manager can access this route' });
            }
            try {
                const employees = await search.getQuery(req.query);
                if (employees.length === 0) {
                return res.status(404).json({ message: 'There are no search results for your query' });
                }
                return res.status(200).json({ employees }); 
            } catch(error){
                console.log("=======>Error====>", error)
                return res.status(500).json({ error: "Internal Server Error"});
            }
        }

}
export default EmployeeManager;
