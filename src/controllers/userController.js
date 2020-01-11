import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import sGmail from '@sendgrid/mail';
import model from '../db/models/index';
import {signupValidator, loginValidator} from '../middlewares/userValidation';



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
            
            // const sendCongrat = async(email, token) =>  {
            //     const message = {
            //       to: email,
            //       from: 'awesomity@gmail.com',
            //       Subject: `Hello ${email}`,
            //       text: 'Haapa is pleasure to have a user like you!',
            //       html: `<p>Hello There, <br />
            //       Thank you very much for joining our company.
            //       </p>
            //       <br />
            //       <p>Best Regards, <b>Awesomity</b></p>
            //   ` 
            //     };
            //     sGmail.setApiKey(process.env.SENDGRID_API_KEY);
            //     await sGmail.send(message);
            // };

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

            //  Send email verification to user email account
            // await sendCongrat(email, token);

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

}
export default UserManager;
