import axios from 'axios';

import kapp from '../server/kapp';

export async function getAuthorizedCalendlyInstance(org: string) {
  const authTokenSetting = await kapp.org(org).settings.get();
  return axios.create({
    baseURL: 'https://api.calendly.com',
    headers: {
      Authorization: `Bearer ${authTokenSetting?.default.authToken as string}`,
    },
  });
}
