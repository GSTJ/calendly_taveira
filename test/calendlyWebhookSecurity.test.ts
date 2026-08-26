import { UnauthorizedError } from '@kustomer/apps-server-sdk';
import { createHmac } from 'crypto';

import {
  CALENDLY_WEBHOOK_TOLERANCE_MS,
  getCalendlyWebhookSigningKey,
  verifyCalendlyWebhook,
} from '../src/utils/calendlyWebhookSecurity';

const org = 'org-123';
const body = { event: 'invitee.created', payload: { uri: 'example' } };
const now = 1_800_000_000_000;

function sign(timestamp: number, payload: unknown) {
  const timestampSeconds = Math.floor(timestamp / 1000).toString();
  const signature = createHmac('sha256', getCalendlyWebhookSigningKey(org))
    .update(`${timestampSeconds}.${JSON.stringify(payload)}`, 'utf8')
    .digest('hex');

  return `t=${timestampSeconds},v1=${signature}`;
}

describe('Calendly webhook authentication', () => {
  it('accepts a current webhook with a valid signature', () => {
    expect(() =>
      verifyCalendlyWebhook(
        org,
        { 'calendly-webhook-signature': sign(now, body) },
        body,
        now,
      ),
    ).not.toThrow();
  });

  it('rejects a modified payload', () => {
    expect(() =>
      verifyCalendlyWebhook(
        org,
        { 'calendly-webhook-signature': sign(now, body) },
        { ...body, event: 'invitee.canceled' },
        now,
      ),
    ).toThrow(UnauthorizedError);
  });

  it.each([
    now - CALENDLY_WEBHOOK_TOLERANCE_MS - 1000,
    now + CALENDLY_WEBHOOK_TOLERANCE_MS + 1000,
  ])('rejects a replay outside the tolerance window', timestamp => {
    expect(() =>
      verifyCalendlyWebhook(
        org,
        { 'calendly-webhook-signature': sign(timestamp, body) },
        body,
        now,
      ),
    ).toThrow(UnauthorizedError);
  });

  it.each([undefined, '', 't=abc,v1=nope', 't=1800000000'])(
    'rejects a missing or malformed signature',
    signature => {
      expect(() =>
        verifyCalendlyWebhook(
          org,
          { 'calendly-webhook-signature': signature },
          body,
          now,
        ),
      ).toThrow(UnauthorizedError);
    },
  );
});
