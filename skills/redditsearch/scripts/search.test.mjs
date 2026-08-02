import assert from 'node:assert/strict';
import test from 'node:test';

import { search } from './search.mjs';

test('restricts Web Search to reddit.com and requests detailed synthesis', async () => {
  process.env.XAI_API_KEY = 'test-key';
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return { ok: true, json: async () => ({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'Summary' }] }] }) };
  };

  await search('airport stability');

  assert.deepEqual(requestBody.tools, [{
    type: 'web_search',
    filters: { allowed_domains: ['reddit.com'] },
  }]);
  assert.match(requestBody.input[0].content, /Read the post, thread/);
  assert.match(requestBody.input[0].content, /direct reddit\.com post URL/);
});

test('requires an API key', async () => {
  delete process.env.XAI_API_KEY;
  await assert.rejects(search('airport stability'), /XAI_API_KEY is required/);
});

test('uses official base URL by default and supports override', async () => {
  process.env.XAI_API_KEY = 'test-key';
  delete process.env.XAI_BASE_URL;
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(url);
    return { ok: true, json: async () => ({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'Summary' }] }] }) };
  };
  await search('airport stability');
  process.env.XAI_BASE_URL = 'https://proxy.example/v1';
  await search('airport stability');
  delete process.env.XAI_BASE_URL;
  assert.equal(urls[0], 'https://api.x.ai/v1/responses');
  assert.equal(urls[1], 'https://proxy.example/v1/responses');
});

test('detects search execution from proxy usage metadata', async () => {
  process.env.XAI_API_KEY = 'test-key';
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      output: [{ type: 'message', content: [{ type: 'output_text', text: 'Summary' }] }],
      usage: { num_server_side_tools_used: 1 },
    }),
  });

  const response = await search('airport stability');

  assert.equal(response.search_executed, true);
});

test('extracts reddit post links when citation annotations are missing', async () => {
  process.env.XAI_API_KEY = 'test-key';
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      output: [{ type: 'message', content: [{
        type: 'output_text',
        text: 'Discussion: https://www.reddit.com/r/DeepSeek/comments/abc123/example/.',
      }] }],
      usage: { num_server_side_tools_used: 1 },
    }),
  });

  const response = await search('DeepSeek V4 Flash');

  assert.deepEqual(response.citations, [{
    url: 'https://www.reddit.com/r/DeepSeek/comments/abc123/example/',
    title: 'Reddit post',
  }]);
});

test('removes internal render tags', async () => {
  process.env.XAI_API_KEY = 'test-key';
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      output: [{ type: 'message', content: [{ type: 'output_text', text: 'Summary<grok:render>internal</grok:render>' }] }],
    }),
  });

  const response = await search('airport stability');

  assert.equal(response.content, 'Summary');
});

test('rejects an empty upstream response', async () => {
  process.env.XAI_API_KEY = 'test-key';
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ output: [] }) });

  await assert.rejects(search('airport stability'), /empty response from upstream/);
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
      output: [{ type: 'message', content: [{
        type: 'output_text',
        text: 'Found discussion',
        annotations: [{ type: 'url_citation', url: 'https://www.reddit.com/r/test/comments/123', title: 'Topic' }],
      }] }],
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
