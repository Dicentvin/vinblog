import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id:       'bytescribe',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
