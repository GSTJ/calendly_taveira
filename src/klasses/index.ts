import kapp from '../server/kapp';
import { event } from './event';

export enum Klasses {
  Event = 'event_klass',
}

kapp.useKlass(Klasses.Event, event);
