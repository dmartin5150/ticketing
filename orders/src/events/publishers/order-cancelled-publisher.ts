import { Publisher, OrderCancelledEvent, Subjects} from "@dm5150tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  
}