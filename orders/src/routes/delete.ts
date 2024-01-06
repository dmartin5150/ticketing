import express, {Request, Response} from 'express';
import { Order, OrderStatus } from '../models/order';
import { requireAuth, NotFoundError, NotAuthorizedError } from '@dm5150tickets/common';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';


const router = express.Router();

router.delete('/api/orders/:orderid',requireAuth, async (req:Request, res:Response) => {
  const {orderid} = req.params;


  const order = await Order.findById(orderid).populate('ticket');

  if (!order) {
    throw new NotFoundError();
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  order.status = OrderStatus.Cancelled;
  await order.save();
  // publish event saying this was cancelled 


  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id
    }
  })

  res.send(204);
});

export { router as deleteOrderRouter}