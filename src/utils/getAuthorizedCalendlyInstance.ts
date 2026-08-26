import axios from 'axios';

import kapp from '../server/kapp';
import { CALENDLY_API_ORIGIN, secureCalendlyRequest } from './calendlyApi';

export function createAuthorizedCalendlyInstance(authToken: string) {
  if (typeof authToken !== 'string' || !authToken.trim()) {
    throw new Error('Calendly auth token is required');
  }

  const instance = axios.create({
    allowAbsoluteUrls: false,
    baseURL: CALENDLY_API_ORIGIN,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    maxRedirects: 0,
  });

  instance.interceptors.request.use(secureCalendlyRequest);

  return instance;
}

export async function getAuthorizedCalendlyInstance(org: string) {
  const authTokenSetting = await kapp.org(org).settings.get();
  return createAuthorizedCalendlyInstance(
    authTokenSetting?.default.authToken as string,
  );
}
