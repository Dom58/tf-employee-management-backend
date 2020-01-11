// import 'regenerator-runtime';
import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import swaggerUI from 'swagger-ui-express';
import cron from 'node-cron';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import users from '../src/routes/userRoute'
// import swaggerJSDoc from '../swagger.json';

dotenv.config();

const app = express(); // setup express application

app.use(cors());
app.use(logger('dev')); // log requests to the console

// Parse incoming requests data
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(users);

// Access swagger ui documentation on this route
// app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerJSDoc));

app.get('/', (req, res) => res.status(200).send({
  message: 'Welcome to Employee management system APIs',
}));

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://127.0.0.1:${process.env.PORT}`);
});

export default app;
