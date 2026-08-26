import { UnauthorizedError } from '@kustomer/apps-server-sdk';
import { createHmac, timingSafeEqual } from 'crypto';

export const CALENDLY_WEBHOOK_TOLERANCE_MS = 3 * 60 * 1000;

type WebhookHeaders = Record<string, string | string[] | undefined>;

export function getCalendlyWebhookSigningKey(org: string) {
  const clientSecret = process.env.CLIENT_SECRET;

  if (!clientSecret) {
    throw new Error('clientSecret is required');
  }

  return createHmac('sha256', clientSecret)
    .update(`calendly-webhook:${org}`, 'utf8')
    .digest('hex');
}

function getSignatureHeader(headers: WebhookHeaders) {
  const value =
    headers['calendly-webhook-signature'] ||
    headers['Calendly-Webhook-Signature'];

  return Array.isArray(value) ? value[0] : value;
}

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(received, 'hex');

  return (
    expectedBuffer.length === receivedBuffer.length &&
    expectedBuffer.length > 0 &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function verifyCalendlyWebhook(
  org: string,
  headers: WebhookHeaders,
  body: unknown,
  now = Date.now(),
) {
  const signatureHeader = getSignatureHeader(headers);

  if (!signatureHeader) {
    throw new UnauthorizedError('invalid Calendly webhook signature');
  }

  const signatureParts = signatureHeader.split(',').reduce(
    (parts, item) => {
      const [key, value, ...rest] = item.trim().split('=');

      if (!key || !value || rest.length) return parts;
      if (key === 't') parts.timestamp = value;
      if (key === 'v1') parts.signatures.push(value);

      return parts;
    },
    { timestamp: '', signatures: [] as string[] },
  );

  if (
    !/^\d{1,12}$/.test(signatureParts.timestamp) ||
    !signatureParts.signatures.length
  ) {
    throw new UnauthorizedError('invalid Calendly webhook signature');
  }

  const timestampMs = Number(signatureParts.timestamp) * 1000;

  if (
    !Number.isSafeInteger(timestampMs) ||
    Math.abs(now - timestampMs) > CALENDLY_WEBHOOK_TOLERANCE_MS
  ) {
    throw new UnauthorizedError('invalid Calendly webhook signature');
  }

  const signedPayload = `${signatureParts.timestamp}.${JSON.stringify(body)}`;
  const expectedSignature = createHmac(
    'sha256',
    getCalendlyWebhookSigningKey(org),
  )
    .update(signedPayload, 'utf8')
    .digest('hex');

  if (
    !signatureParts.signatures.some(signature =>
      signaturesMatch(expectedSignature, signature),
    )
  ) {
    throw new UnauthorizedError('invalid Calendly webhook signature');
  }
}
