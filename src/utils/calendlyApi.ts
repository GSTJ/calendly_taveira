import { InternalAxiosRequestConfig } from 'axios';

export const CALENDLY_API_ORIGIN = 'https://api.calendly.com';

const CALENDLY_IDENTIFIER = '[A-Za-z0-9_-]+';
const ALLOWED_REQUEST_PATHS = [
  /^\/users\/me$/,
  new RegExp(`^/webhook_subscriptions(?:/${CALENDLY_IDENTIFIER})?$`),
  new RegExp(`^/scheduled_events/${CALENDLY_IDENTIFIER}$`),
  new RegExp(`^/event_types/${CALENDLY_IDENTIFIER}$`),
];

function parseCalendlyUrl(uri: string) {
  if (typeof uri !== 'string' || !uri) {
    throw new Error('Calendly URI is required');
  }

  let url: URL;

  try {
    url = new URL(uri);
  } catch {
    throw new Error('Calendly URI is invalid');
  }

  if (
    url.origin !== CALENDLY_API_ORIGIN ||
    url.username ||
    url.password ||
    url.hash
  ) {
    throw new Error('Calendly URI is outside the allowed API origin');
  }

  return url;
}

function parseCalendlyResourceUri(uri: string) {
  const url = parseCalendlyUrl(uri);

  if (url.search) {
    throw new Error('Calendly resource URI cannot contain a query string');
  }

  return url;
}

export function getCalendlyScheduledEventPath(inviteeUri: string) {
  const { pathname } = parseCalendlyResourceUri(inviteeUri);
  const match = pathname.match(
    new RegExp(
      `^/scheduled_events/(${CALENDLY_IDENTIFIER})/invitees/(${CALENDLY_IDENTIFIER})$`,
    ),
  );

  if (!match) {
    throw new Error('Calendly invitee URI has an unexpected path');
  }

  return `/scheduled_events/${match[1]}`;
}

export function getCalendlyInviteeId(inviteeUri: string) {
  const { pathname } = parseCalendlyResourceUri(inviteeUri);
  const match = pathname.match(
    new RegExp(
      `^/scheduled_events/${CALENDLY_IDENTIFIER}/invitees/(${CALENDLY_IDENTIFIER})$`,
    ),
  );

  if (!match) {
    throw new Error('Calendly invitee URI has an unexpected path');
  }

  return match[1];
}

export function getCalendlyResourcePath(
  uri: string,
  collection: 'event_types' | 'organizations' | 'webhook_subscriptions',
) {
  const { pathname } = parseCalendlyResourceUri(uri);
  const expectedPath = new RegExp(`^/${collection}/${CALENDLY_IDENTIFIER}$`);

  if (!expectedPath.test(pathname)) {
    throw new Error(`Calendly ${collection} URI has an unexpected path`);
  }

  return pathname;
}

export function secureCalendlyRequest(config: InternalAxiosRequestConfig) {
  const requestUrl = new URL(config.url || '', CALENDLY_API_ORIGIN);

  if (
    requestUrl.origin !== CALENDLY_API_ORIGIN ||
    requestUrl.username ||
    requestUrl.password ||
    requestUrl.hash ||
    !ALLOWED_REQUEST_PATHS.some(pattern => pattern.test(requestUrl.pathname))
  ) {
    throw new Error('Refusing to send credentials outside the Calendly API');
  }

  config.allowAbsoluteUrls = false;
  config.baseURL = CALENDLY_API_ORIGIN;
  config.maxRedirects = 0;
  config.url = `${requestUrl.pathname}${requestUrl.search}`;

  return config;
}
