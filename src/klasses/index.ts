import kapp from '../server/kapp';
import { event } from './event';

export enum Klasses {
  Event = 'Event-Klass',
}

kapp.useKlass(Klasses.Event, event);
