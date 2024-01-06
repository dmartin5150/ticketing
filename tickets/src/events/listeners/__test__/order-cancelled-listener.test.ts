import mongoose from "mongoose";
import { OrderCancelledEvent } from "@dm5150tickets/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../model/ticket";
import { Message } from "node-nats-streaming";

const setUp = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'kfkkdjf',
  });
  ticket.orderId = orderId;
  await ticket.save();


  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 1,
    ticket: {
      id: ticket.id
    }
  }
  //@ts-ignore
  const msg:Message = {
    ack: jest.fn()
  }
  return {listener, ticket, data, msg}
}

it('updates the ticket, publishes the event and acks the message', async () => {
  const {msg, listener, ticket, data} = await setUp();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toBeUndefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();

 
})