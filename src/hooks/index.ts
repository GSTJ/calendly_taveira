import kapp from '../server/kapp';
import { CalendlyHooks } from '../utils/calendly';
import { handleCalendlyEvent } from './handleCalendlyEvent';

kapp.onHook(CalendlyHooks.CalendlyEvent, handleCalendlyEvent);
