import express, { Request, Response} from 'express';
import {body} from 'express-validator';
import { requireAuth, validateRequest } from '@dm5150tickets/common';
import { Ticket } from '../model/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'; 
import { natsWrapper } from '../nats-wrapper';

  

const router = express.Router();

router.post('/api/tickets',requireAuth,[
  body('title')
   .not()
   .isEmpty()
   .withMessage('Title is required'),
  body('price')
    .isFloat({gt:0})
],validateRequest,
 async (req:Request, res:Response) => {
  const {id,title, price} = req.body;
  const userId = req.currentUser!.id;

  const ticket = Ticket.build({
    title,
    price, userId
  });
  
  await ticket.save();

  new TicketCreatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
    version: ticket.version
  })

  res.status(201).send(ticket);

});

export {router as createTicketRouter};