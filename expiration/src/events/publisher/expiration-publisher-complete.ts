import { Subjects, Publisher, ExpirationCompleteEvent } from "@dm5150tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  
}