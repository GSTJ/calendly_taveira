import { appName } from '../constants';
import kapp from '../server/kapp';
import { event } from './event';

export const Klasses = {
  Event: `${appName}-event`,
};

kapp.useKlass(Klasses.Event, event);
