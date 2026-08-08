import assert from 'node:assert/strict';
import { test } from 'node:test';

const baseUrl = process.env.API_BASE_URL ?? 'https://api.tranmere-web.com';
const apiKey = process.env.API_KEY;

function url(path) {
  return new URL(path, `${baseUrl}/`);
}

function headers(additionalHeaders = {}) {
  return {
    ...(apiKey ? { 'x-api-key': apiKey } : {}),
    ...additionalHeaders
  };
}

async function expectOk(response) {
  const responseBody = await response.text();

  assert.equal(
    response.status,
    200,
    `${response.url} returned ${response.status}: ${responseBody}`
  );

  return responseBody;
}

async function expectJson(response) {
  const responseBody = await expectOk(response);

  try {
    return JSON.parse(responseBody);
  } catch {
    assert.fail(`${response.url} did not return valid JSON: ${responseBody}`);
  }
}

test('player search returns players for the requested season', async () => {
  const endpoint = url('/player-search/');
  endpoint.searchParams.set('season', '2024');

  const response = await fetch(endpoint, { headers: headers() });
  const body = await expectJson(response);

  assert.ok(Array.isArray(body.players));
  assert.ok(body.players.length > 0);
  assert.ok(body.players.every((player) => player.Season === '2024'));
});

test('match endpoint returns a successful response', async () => {
  const response = await fetch(url('/match/2020/2021-03-14/'), {
    headers: headers()
  });

  await expectOk(response);
});

test('player GraphQL query returns a successful response', async () => {
  const endpoint = url('/graphql');
  endpoint.searchParams.set(
    'query',
    '{listTranmereWebHatTricks(limit:1){items{Player}}}'
  );

  const response = await fetch(endpoint);

  await expectOk(response);
});

test('contact endpoint accepts a message', async () => {
  const response = await fetch(url('/contact-us'), {
    method: 'POST',
    headers: headers({ 'content-type': 'application/json' }),
    body: JSON.stringify({
      name: 'Chris',
      email: 'test@test.com',
      desc: 'Just a test'
    })
  });

  await expectOk(response);
});
