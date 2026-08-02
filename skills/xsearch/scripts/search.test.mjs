import assert from 'node:assert/strict';
import test from 'node:test';

import { parseArgs, search } from './search.mjs';

test('uses X Search with a date range', async () => {
  process.env.XAI_API_KEY = 'test-key';
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return { ok: true, json: async () => ({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'No results' }] }] }) };
  };

  await search('机场 稳定', { fromDate: '2026-07-01', toDate: '2026-08-01' });

  assert.deepEqual(requestBody.tools, [{
    type: 'x_search',
    from_date: '2026-07-01',
    to_date: '2026-08-01',
  }]);
  assert.match(requestBody.input[0].content, /Summarize/);
  assert.match(requestBody.input[0].content, /post date/);
  assert.match(requestBody.input[0].content, /supporting and conflicting evidence/);
});

test('parses CLI date filters', () => {
  assert.deepEqual(
    parseArgs(['机场', '稳定', '--from', '2026-07-01', '--to', '2026-08-01']),
    { query: '机场 稳定', fromDate: '2026-07-01', toDate: '2026-08-01' },
  );
});

test('requires an API key', async () => {
  delete process.env.XAI_API_KEY;
  await assert.rejects(search('机场 稳定'), /XAI_API_KEY is required/);
});

test('uses official base URL by default and supports override', async () => {
  process.env.XAI_API_KEY = 'test-key';
  delete process.env.XAI_BASE_URL;
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(url);
    return { ok: true, json: async () => ({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'No results' }] }] }) };
  };
  await search('机场 稳定');
  process.env.XAI_BASE_URL = 'https://proxy.example/v1';
  await search('机场 稳定');
  delete process.env.XAI_BASE_URL;
  assert.equal(urls[0], 'https://api.x.ai/v1/responses');
  assert.equal(urls[2], 'https://proxy.example/v1/responses');
});

test('detects search execution from proxy usage metadata', async () => {
  process.env.XAI_API_KEY = 'test-key';
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      output: [{ type: 'message', content: [{ type: 'output_text', text: 'No results', annotations: [] }] }],
      usage: { num_server_side_tools_used: 1 },
    }),
  });

  const response = await search('机场 稳定');

  assert.equal(response.search_executed, true);
});

test('rejects an empty upstream response', async () => {
  process.env.XAI_API_KEY = 'test-key';
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ output: [] }) });

  await assert.rejects(search('机场 稳定'), /empty response from upstream/);
});

test('extracts X post links and removes internal render tags', async () => {
  process.env.XAI_API_KEY = 'test-key';
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      output: [{ type: 'message', content: [{
        type: 'output_text',
        text: 'Result https://x.com/user/status/123<grok:render>internal</grok:render>',
        annotations: [],
      }] }],
      usage: { num_server_side_tools_used: 1 },
    }),
  });

  const response = await search('机场 稳定');

  assert.deepEqual(response.citations, [{ url: 'https://x.com/user/status/123', title: 'X post' }]);
  assert.equal(response.content, 'Result https://x.com/user/status/123');
});

test('keeps the synthesis and recovers post links separately', async () => {
  process.env.XAI_API_KEY = 'test-key';
  const requestBodies = [];
  globalThis.fetch = async (_url, options) => {
    requestBodies.push(JSON.parse(options.body));
    if (requestBodies.length === 1) {
      return { ok: true, json: async () => ({
        output: [{ type: 'message', content: [{ type: 'output_text', text: 'Summary without links' }] }],
        usage: { num_server_side_tools_used: 1 },
      }) };
    }
    return { ok: true, json: async () => ({
      output: [{ type: 'message', content: [{ type: 'output_text', text: 'Result https://x.com/user/status/123' }] }],
      usage: { num_server_side_tools_used: 1 },
    }) };
  };

  const response = await search('DeepSeek V4 Flash 0731');

  assert.equal(requestBodies.length, 2);
  assert.match(requestBodies[1].input[0].content, /only direct post URLs/i);
  assert.equal(response.content, 'Summary without links');
  assert.deepEqual(response.citations, [{ url: 'https://x.com/user/status/123', title: 'X post' }]);
  assert.equal(response.search_executed, true);
});

test('keeps searched content when the upstream omits citations', async () => {
  process.env.XAI_API_KEY = 'test-key';
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    return { ok: true, json: async () => ({
      output: [{ type: 'message', content: [{ type: 'output_text', text: requestCount === 1 ? 'Community discussion exists' : 'No source URLs returned' }] }],
      usage: { num_server_side_tools_used: 1 },
    }) };
  };

  const response = await search('DeepSeek V4 Flash 0731');

  assert.equal(response.content, 'Community discussion exists');
  assert.deepEqual(response.citations, []);
  assert.equal(response.search_executed, true);
});

test('retries transient request failures three times', async () => {
  process.env.XAI_API_KEY = 'test-key';
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    if (requestCount < 4) {
      return { ok: false, status: 503, headers: { get: () => '0' }, json: async () => ({ error: { message: 'Unavailable' } }) };
    }
    return { ok: true, json: async () => ({
      output: [{ type: 'message', content: [{ type: 'output_text', text: 'Result https://x.com/user/status/123' }] }],
      usage: { num_server_side_tools_used: 1 },
    }) };
  };

  const response = await search('DeepSeek V4 Flash');

  assert.equal(requestCount, 4);
  assert.equal(response.citations.length, 1);
});

test('retries client errors three times and reports the upstream response', async () => {
  process.env.XAI_API_KEY = 'test-key';
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    return {
      ok: false,
      status: 400,
      headers: { get: () => '0' },
      text: async () => '{"message":"Invalid request"}',
    };
  };

  await assert.rejects(search('DeepSeek V4 Flash'), /HTTP 400:.*Invalid request/);
  assert.equal(requestCount, 4);
});
