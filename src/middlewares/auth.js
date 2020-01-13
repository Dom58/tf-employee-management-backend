import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config();

const isAuthenticated = (req, res, next) => {

	try {
	    const header = req.headers.authorization;
	    if (!header || header === '') return res.status(403).json({ status: 403, error: 'Forbidden' });

	    const token = jwt.verify(header, `${process.env.SECRET_JWT_KEY}`, { expiresIn: '24h'});
	    req.user = token;
	    next();
	} 
	catch(error){
	    return res.status(401).json({ status: 401, error: 'Access Denied!' });
	}
};

export default isAuthenticated;
