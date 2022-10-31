import { appName } from '../constants';
import kapp from '../server/kapp';
import { scheme } from './scheme';

export const Klasses = {
  Event: `${appName}-event`,
};

kapp.useKlass(Klasses.Event, scheme);
