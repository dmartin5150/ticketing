import express, {Request, Response} from 'express';
import { requireAuth, NotFoundError, NotAuthorizedError } from '@dm5150tickets/common';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';


const router = express.Router();

router.get('/api/orders/:orderid',requireAuth, async (req:Request, res:Response) => {
  const order  = await Order.findById(req.params.orderid).populate('ticket');
  if (!order) {
    throw new NotFoundError();
  }

  if(order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }
  res.status(200).send(order);
});

export { router as showOrderRouter}