import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@dm5150tickets/common';
import { Password } from '../services/password';
import { User } from '../models/user';


const router = express.Router();
 
router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password must be  supplied'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passowrdsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passowrdsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    // create JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );
    //Store it in the session
    req.session = {
      jwt: userJwt,
    };
    res.status(201).send(existingUser);

    res.send({});
    console.log('hi there');
  }
);

export { router as signinRouter };
