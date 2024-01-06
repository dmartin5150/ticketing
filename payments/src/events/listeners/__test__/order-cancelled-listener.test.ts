import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/orders";
import mongoose from "mongoose";
import { OrderStatus, OrderCancelledEvent } from "@dm5150tickets/common";


const setUp = async () => { 
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: 'kfjd',
    version: 0
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'kdjfdk'
    }
  };

  //@ts-ignore
  const msg:Message = {
    ack: jest.fn()
  }


  return { listener, order, data, msg}

}

it('updates the status of the order', async () => {
  const { listener, order, msg, data } = await setUp();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

});

it('acks the message', async () => {
  const { listener, order, msg, data } = await setUp();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});