import {Publisher, Subjects, TicketUpdatedEvent} from "@dm5150tickets/common";

export class TicketUpdatedPublisher extends Publisher <TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
} 