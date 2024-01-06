import mongoose from "mongoose";
import { OrderCreatedEvent, OrderStatus } from "@dm5150tickets/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { Order } from "../../../models/orders";


const setUp = () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data:OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'fkdjf',
    userId: 'fjfkd',
    status: OrderStatus.Created,
    ticket: {
      id: 'fkjfd',
      price: 40
    }
  }

  //@ts-ignore
  const msg:Message = {
    ack: jest.fn()
  }

  return { listener, data, msg}
}

it('replicates the order info', async () => {
  const {listener, data, msg} = await setUp();

  await listener.onMessage(data, msg);
  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const {listener, data, msg} = await setUp();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();

});