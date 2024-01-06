import express, {Request, Response} from 'express';
import { NotFoundError } from '@dm5150tickets/common';
import { Ticket } from '../model/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req:Request, res:Response) => {
  const ticket  = await Ticket.findById(req.params.id);

  if(!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);

});

export { router as showTicketRouter};