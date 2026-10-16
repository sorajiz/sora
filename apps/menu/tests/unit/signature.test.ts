import { describe, it, expect, beforeEach } from 'vitest';
import { verifySignedRequest, signInternalPayload } from '@/lib/auth/signature';

const PRIMARY_SECRET = 'primary-secret-test-key-32byteslong!';
const PREVIOUS_SECRET = 'previous-secret-test-key-32byteslong!';

describe('Signed Internal HTTP (§S10)', () => {
  beforeEach(() => {
    process.env.MENU_INTERNAL_API_SECRET = PRIMARY_SECRET;
    process.env.MENU_INTERNAL_API_SECRET_PREVIOUS = PREVIOUS_SECRET;
  });

  it('validates a correctly signed payload in constant time', () => {
    const rawBody = JSON.stringify({ event: 'MENU_PRODUCT_UPDATED', public_version: 53 });
    const header = signInternalPayload(rawBody, PRIMARY_SECRET);

    const res = verifySignedRequest({
      rawBody,
      signatureHeader: header
    });

    expect(res.valid).toBe(true);
  });

  it('validates a signature created with the previous rotated secret', () => {
    const rawBody = JSON.stringify({ event: 'MENU_CATEGORY_CHANGED', public_version: 54 });
    const header = signInternalPayload(rawBody, PREVIOUS_SECRET);

    const res = verifySignedRequest({
      rawBody,
      signatureHeader: header
    });

    expect(res.valid).toBe(true);
  });

  it('rejects tampered or forged signatures', () => {
    const rawBody = JSON.stringify({ event: 'TAMPERED_ACTION' });
    const forgedHeader = signInternalPayload(rawBody, 'wrong-attacker-secret');

    const res = verifySignedRequest({
      rawBody,
      signatureHeader: forgedHeader
    });

    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Invalid HMAC signature/);
  });

  it('rejects clock skew exceeding 300 seconds', () => {
    const rawBody = JSON.stringify({ ping: 'pong' });
    const oldTimestamp = Math.floor(Date.now() / 1000) - 305; // 305s in past
    const header = signInternalPayload(rawBody, PRIMARY_SECRET, oldTimestamp);

    const res = verifySignedRequest({
      rawBody,
      signatureHeader: header
    });

    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Clock skew exceeded 300s/);
  });

  it('detects and blocks replayed event_ids within the replay cache window', () => {
    const eventId = 'evt-unique-uuid-12345';
    const rawBody = JSON.stringify({ event_id: eventId, public_version: 55 });
    const header = signInternalPayload(rawBody, PRIMARY_SECRET);

    // First attempt: succeeds
    const firstAttempt = verifySignedRequest({
      rawBody,
      signatureHeader: header,
      eventId
    });
    expect(firstAttempt.valid).toBe(true);

    // Second replay attempt: fails
    const secondAttempt = verifySignedRequest({
      rawBody,
      signatureHeader: header,
      eventId
    });
    expect(secondAttempt.valid).toBe(false);
    expect(secondAttempt.reason).toMatch(/Replayed event_id detected/);
  });
});
