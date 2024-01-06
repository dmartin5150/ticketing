import { OrderCreatedListener } from "../order-created-listener"; 
import { OrderCreatedEvent, OrderStatus } from "@dm5150tickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../model/ticket";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";


const setUp = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket =  Ticket.build( {
    title: 'concert',
    price: 20,
    userId: 'dfkjdf' 
  });
  await ticket.save();
  // Create fake data object
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'dfkjdf',
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  }
  // Create fake msg object
  //@ts-ignore
  const msg:Message = {
    ack: jest.fn()
  }

  return { listener, ticket, data, msg}
}

it('sets the orderId on the ticket', async ()=>{
  const {listener, ticket, msg, data} = await setUp();

  await listener.onMessage(data,msg);
  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
  const {listener, ticket, msg, data} = await setUp();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const {listener, ticket, data, msg} = await setUp();
  
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  
  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});