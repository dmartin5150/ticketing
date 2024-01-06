import mongoose from "mongoose";
import { OrderStatus } from "../../../models/order";
import { Message } from "node-nats-streaming";
import { ExpirationCompleteEvent } from "@dm5150tickets/common";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";



const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 50,
  });
  await ticket.save();
  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'dkfjdk',
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, order,ticket, data, msg};

}


it('updates the order status to cancelled', async () => {
  const {listener, order,  data, msg} = await setup();

  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toBe(OrderStatus.Cancelled);
});

it('emits an OrderedCancelled event', async () => {
  const {listener,  order, data, msg} = await setup();

  await listener.onMessage(data, msg);


  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  
  expect(eventData.id).toEqual(order.id);

});

it('acks a message', async () => {
  const {listener,  data, msg} = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();

})
