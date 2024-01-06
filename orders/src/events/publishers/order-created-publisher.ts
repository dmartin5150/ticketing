import { Publisher, OrderCreatedEvent, Subjects} from "@dm5150tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  
}