import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {
  //Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 100,
    userId: '123'
  })
  //Save the ticket to the database
  await ticket.save();
  //fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  // make two separate changes to the tickets we fetched
  firstInstance!.set({price:10});
  secondInstance!.set({price:15});
  // save the first ticket we changed 
  await firstInstance!.save();
  // save the second changed ticket and expect an error 
  try {
    await secondInstance!.save();
  } catch(err) {
    return;
  }
  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 100,
    userId: '123'
  });
  await ticket.save();
  const firstInstance = await Ticket.findById(ticket.id);
  expect(firstInstance!.version).toEqual(0); 
  await firstInstance!.save();
  const secondInstance = await Ticket.findById(ticket.id);
  expect(secondInstance!.version).toEqual(1);
  await secondInstance!.save();
  const thirdInstance = await Ticket.findById(ticket.id);
  expect(thirdInstance!.version).toEqual(2); 
})