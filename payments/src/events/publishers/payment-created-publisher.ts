import { Subjects, Publisher, PaymentCreatedEvent } from "@dm5150tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;


}