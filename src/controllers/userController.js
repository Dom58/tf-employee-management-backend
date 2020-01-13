import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import sGmail from '@sendgrid/mail';
import model from '../db/models/index';
import {
    signupValidator, 
    loginValidator, 
    updateProfileValidator,
    resetPasswordValidator
} from '../middlewares/userValidation';



dotenv.config();

const { User } = model;

/**
 * user controller
 */

class UserManager {
    /**
     *
     * @param {Object} req
     * @param {Object} res
     * @returns {Object} manager object
     */
    
    static async manager_signup(req, res) { 
        const {email, name, national_id, phone_number, status, date_birth, password} = req.body;

        if(phone_number.length != 9 || (phone_number.substr(0, 2)!= '78' && phone_number.substr(0, 2)!= '73' && phone_number.substr(0, 2)!= '72') ){
            return res.status(400).json({errors: `Phone number ## ${phone_number} ## must be 9 digits and starts with 78...,73...,72,..`});
        }

        const errors = signupValidator(req.body);
        if (errors) {
            return res.status(400).json({errors});
        } 
        try {

            const findUser = await User.findOne({where: {email}});
            const findNid = await User.findOne({where: {national_id}});
            const findPhone = await User.findOne({where: {phone_number}});

            if(findUser) {
             return res.status(409).json({errors: 'Email already exist, Please enter a new email!'});
            }
            
            if(findPhone) {
                return res.status(409).json({errors: 'Phone number already recoded, Please enter a new number!'});
            }
            if(findNid) {
                return res.status(409).json({errors: 'National id already recoded, Please enter a new one!'});
            }

            const userData = await User.create({
                name,
                national_id,
                phone_number: '+250'+phone_number,
                email,
                status: status || "inactive",
                date_birth,
                position: "manager",
                password :  await bcrypt.hash(password, 12)
            });
            const payload = {
                id: userData.dataValues.id,
                national_id: userData.dataValues.national_id,
                email: userData.dataValues.email
            }
            const token = jwt.sign(payload, process.env.SECRET_JWT_KEY);

            return res.status(201).json(
                {message: 'Manager crested successfully',
                token,
                data: {
                    id: userData.dataValues.id,
                    national_id: userData.dataValues.national_id,
                    phone_number: userData.dataValues.phone_number,
                    email: userData.dataValues.email,
                    date_birth: userData.dataValues.date_birth,
                    status: userData.dataValues.status,
                    position: userData.dataValues.position
                }
            });

        } catch(error) {
            console.log(error)
            return res.status(500).json({ error: 'Internal Server Error, Please check well the input' });
            }

    }

        /**
     *
     * @param {Object} req
     * @param {Object} res
     * @returns {Object} signin object
     */
    static async login(req, res) {

        const {email, password} = req.body;

        const errors = loginValidator(req.body);
        if (errors) {
            return res.status(400).json({errors});
        }

        try {
            const findUser = await User.findOne({where: {email}});
            if(!findUser) {
             return res.status(400).json({errors: 'No user found!'});
            }

        // check if the user's password match
            const comparePassword = bcrypt.compareSync(password, findUser.password);
            if (!comparePassword) {
                return res.status(200).json({errors: 'Incorrect password'});
            }
            const payload = {
            id: findUser.id,
            name: findUser.name,
            national_id: findUser.national_id,
            phone_number: findUser.phone_number,
            email: findUser.email,
            status: findUser.status,
            position: findUser.position
            }

        // form a token
            const token = jwt.sign(payload, `${process.env.SECRET_JWT_KEY}`, {expiresIn: '24h'});
            
            return res.status(200).json(
                {
                    message: 'You are successfully login',
                    token:token, 
                    user: {
                        id: findUser.dataValues.id,
                        national_id: findUser.dataValues.national_id,
                        phone_number: findUser.dataValues.phone_number,
                        email: findUser.dataValues.email,
                        date_birth: findUser.dataValues.date_birth,
                        position: findUser.dataValues.position,
                    }
                });

        } catch(error) {
            console.log("-======Error=====", error);
            return res.status(500).json({ error: 'Internal Server Error, Please try again' });
        }

    }

    static async all_users(req, res) {

        if (req.user.position !== 'manager') {
            return res.status(401).json({ error: 'Access Denied. Only manager can access this route' });
        }

        try {
            const users=await User.findAll({
                order: [['updatedAt', 'DESC']],
            });

            if (!users[0]) {
                return res.status(404).json({
                    message: "No manager created yet"
                })
            }
            
            return res.status(200).json({
                data: users
            });

        } catch(error){
            return res.status(500).json({ error: 'Internal Server Error, Please try again' });
        }
    }

    static async update_profile(req, res) { 

        const {name,national_id,phone_number,date_birth,email} = req.body
        const { id } = req.user;
        const { manager_id } = req.params;
        const convertedId = parseInt(manager_id)
        
        const errors = updateProfileValidator(req.body);
        if (errors) {
            return res.status(400).json({errors});
        }

        try { 

            const findManager = await User.findOne({where: {id: convertedId}});

            if(!findManager) {
                return res.status(404).json({ error: `Manager with id #${convertedId}# not found!` });
            }

            if(convertedId !== id) {
                return res.status(404).json({ error: `You are not allowed to update others profile` });
            }

            const updateInfo= {
                name: name ||findManager.dataValues.name,
                national_id: national_id||findManager.dataValues.national_id,
                phone_number: phone_number || findManager.dataValues.phone_number,
                date_birth: date_birth || findManager.dataValues.date_birth,
                email: email || findManager.dataValues.email
            }
                
                await User.update(updateInfo,{where:{id: findManager.id}});
                const updatedUser = await User.findOne({where:{id: findManager.id}});

                return res.status(200).json({ 
                    message:"User Info Updated Successfully!",
                    data: updatedUser.dataValues
                })

        } catch(error){
            return res.status(500).json({ error: 'Internal Server Error, Please try again' });
        }
    }

    static async forgot_password(req, res) {
        const sendResetPasswordLink = async(name,email, token) =>  {
            const message = {
                to: email,
                from: 'smart.managers@gmail.com',
                Subject: `Password Reset `,
                text: 'SmartManagers Ltd is pleasure to have a Manager like you!',
                html: `<p>Hello ${name}, 
                <br />
                Dear ${name.bold()},<br>You have requested to reset your password.
                </p>

                <br />
                <a href=http://localhost:7000/manager/reset_password/${token} target='_blank' style='margin-left: 8%; margin-top: 100px;  border: 1px solid white; text-align: center; margin-top: 8px; background-color: #f15921; color: white; border-radius: 5px; cursor: pointer; outline: none; padding: 8px; text-decoration: none;'> Reset your Password </a>
                <br />
                <p>Best Regards, <b>SmartManagers</b></p>
          ` 
            };
            sGmail.setApiKey(process.env.SENDGRID_API_KEY);
            await sGmail.send(message);
        };

        const {email}= req.body;
        try {

            const findManager = await User.findOne({where: {email}});
            if(!findManager) {
              return res.status(400).json({error: 'Email not exist!'});
            }

            const payload = {
                id: findManager.dataValues.id,
                name: findManager.dataValues.name,
                email: findManager.dataValues.email
            }

            const name = findManager.dataValues.name;
            const token = jwt.sign(payload, process.env.SECRET_JWT_KEY, {expiresIn: '24h'});

            // Send reset password url on user email
            await sendResetPasswordLink(name, email, token);

            return res.status(200).json({message:'Please check your email address to reset your password!'});

          } catch (error) {
            //   console.log(error)
            return res.status(500).json({error:'Internal Server Error! Please try again later'});
            };
    }

    static async reset_password (req, res){
        const {password, confirm_password} = req.body;
        const {token} = req.params;

        const errors = resetPasswordValidator(req.body);
        if (errors) {
            return res.status(400).json({errors});
        } 
        try {
            const decodedToken = jwt.decode(token);
            const findManager = await User.findOne({where: {email:decodedToken.email}});
      
            if(!findManager) {
              return res.status(400).json({error: 'Email not exist!'});
            }
      
            // change password 
            const hashPassword = await bcrypt.hash(password, 12);
            await User.update({ password: hashPassword}, { where: { id: findManager.id } });

            return res.status(200).json({message:'Password changed successfully, Return to Login!'});

        } catch(error){
            return res.status(500).json({error: 'Internal Server Error'});
        }
    }

}
export default UserManager;
