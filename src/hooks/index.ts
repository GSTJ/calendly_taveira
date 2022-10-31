import kapp from '../server/kapp';
import { CalendlyHooks } from '../utils/registerWebhooks';
import { handleCalendlyEvent } from './handleCalendlyEvent';

kapp.onHook(CalendlyHooks.CalendlyEvent, handleCalendlyEvent);
