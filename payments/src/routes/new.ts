import express from 'express';
import { Request, Response} from 'express';
import { body} from 'express-validator';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';


import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@dm5150tickets/common';
import { stripe } from '../stripe';
import { Order } from '../models/orders';
import { Payment } from '../models/payments';



const router = express.Router();

router.post('/api/payments',
requireAuth,
[
 body('token')
 .not()
 .isEmpty(),
 body('orderId')
  .not()
  .isEmpty()
],validateRequest,
async (req:Request, res:Response) => {
  const { token, orderId } = req.body;


  const order = await Order.findById(orderId);


  if (!order) {
    console.log('Order not found')
    throw new NotFoundError();
  }

  if(order.userId !== req.currentUser!.id) {
    console.log('user')
    throw new NotAuthorizedError();
  }
 
  if (order.status === OrderStatus.Cancelled) {
    throw new BadRequestError('Can not pay for canceled order');
  }
     
  const charge = await stripe.charges.create({
    currency: 'usd',
    amount: order.price * 100,
    source: token
  });

  console.log('orderId', order.id,'stripeId', charge.id);
 
  const payment = Payment.build({
    orderId,
    stripeId: charge.id
  });
  try {
    await payment.save();
  } catch(err) {
    console.log('error', err)
  }
 
  new PaymentCreatedPublisher(natsWrapper.client).publish({
    id: payment.id,
    orderId: payment.orderId,
    stripeId: payment.stripeId,
  });
  res.send({id: payment.id});

});

export { router as createChargeRouter};