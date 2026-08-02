import assert from 'node:assert/strict';
import test from 'node:test';

import { search } from './search.mjs';

test('restricts Web Search to linux.do', async () => {
  process.env.XAI_API_KEY = 'test-key';
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return { ok: true, json: async () => ({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'No results' }] }] }) };
  };

  await search('proxy stability');

  assert.deepEqual(requestBody.tools, [{
    type: 'web_search',
    filters: { allowed_domains: ['linux.do'] },
  }]);
  assert.match(requestBody.input[0].content, /site:linux\.do/);
  assert.match(requestBody.input[0].content, /Read the topic and replies/);
  assert.match(requestBody.input[0].content, /Summarize/);
  assert.match(requestBody.input[0].content, /promotional content/);
});

test('requires an API key', async () => {
  delete process.env.XAI_API_KEY;
  await assert.rejects(search('proxy stability'), /XAI_API_KEY is required/);
});

test('uses official base URL by default and supports override', async () => {
  process.env.XAI_API_KEY = 'test-key';
  delete process.env.XAI_BASE_URL;
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(url);
    return { ok: true, json: async () => ({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'No results' }] }] }) };
  };
  await search('proxy stability');
  process.env.XAI_BASE_URL = 'https://proxy.example/v1';
  await search('proxy stability');
  delete process.env.XAI_BASE_URL;
  assert.equal(urls[0], 'https://api.x.ai/v1/responses');
  assert.equal(urls[2], 'https://proxy.example/v1/responses');
});

test('passes through citations returned by the proxy', async () => {
  process.env.XAI_API_KEY = 'test-key';
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      output: [{ type: 'message', content: [{
        type: 'output_text',
        text: 'Summary',
        annotations: [
          { type: 'url_citation', url: 'https://linux.do/t/topic/123', title: 'Linux DO' },
          { type: 'url_citation', url: 'https://spam.example/review', title: 'Spam' },
        ],
      }] }],
      usage: { num_server_side_tools_used: 2 },
    }),
  });

  const response = await search('proxy stability');

  assert.deepEqual(response.citations, [
    { url: 'https://linux.do/t/topic/123', title: 'Linux DO' },
    { url: 'https://spam.example/review', title: 'Spam' },
  ]);
  assert.equal(response.search_executed, true);
});

test('extracts Linux.do topic links when citation annotations are missing', async () => {
  process.env.XAI_API_KEY = 'test-key';
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      output: [{ type: 'message', content: [{
        type: 'output_text',
        text: 'Discussion: https://linux.do/t/topic/2169105',
      }] }],
      usage: { num_server_side_tools_used: 1 },
    }),
  });

  const response = await search('DeepSeek V4 Flash');

  assert.deepEqual(response.citations, [{
    url: 'https://linux.do/t/topic/2169105',
    title: 'Linux.do topic',
  }]);
});

test('rejects an empty upstream response', async () => {
  process.env.XAI_API_KEY = 'test-key';
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ output: [] }) });

  await assert.rejects(search('proxy stability'), /empty response from upstream/);
});

test('retries with a broader query when the first search has no citations', async () => {
  process.env.XAI_API_KEY = 'test-key';
  const requestBodies = [];
  globalThis.fetch = async (_url, options) => {
    requestBodies.push(JSON.parse(options.body));
    if (requestBodies.length === 1) {
      return { ok: true, json: async () => ({
        output: [{ type: 'message', content: [{ type: 'output_text', text: 'No relevant discussions found.' }] }],
        usage: { num_server_side_tools_used: 1 },
      }) };
    }
    return { ok: true, json: async () => ({
      output: [{ type: 'message', content: [{
        type: 'output_text',
        text: 'Found discussion',
        annotations: [{ type: 'url_citation', url: 'https://linux.do/t/topic/123', title: 'Topic' }],
      }] }],
      usage: { num_server_side_tools_used: 1 },
    }) };
  };

  const response = await search('DeepSeek V4 Flash reviews coding reasoning');

  assert.equal(requestBodies.length, 2);
  assert.match(requestBodies[1].input[0].content, /Query: site:linux\.do DeepSeek V4 Flash$/);
  assert.equal(response.citations.length, 1);
});

test('passes through summaries when the proxy returns off-domain sources', async () => {
  process.env.XAI_API_KEY = 'test-key';
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      output: [{ type: 'message', content: [{
        type: 'output_text',
        text: 'External recommendation',
        annotations: [{ type: 'url_citation', url: 'https://spam.example/review', title: 'Spam' }],
      }] }],
      usage: { num_server_side_tools_used: 1 },
    }),
  });

  const response = await search('proxy stability');

  assert.equal(response.content, 'External recommendation');
  assert.deepEqual(response.citations, [{ url: 'https://spam.example/review', title: 'Spam' }]);
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
        annotations: [{ type: 'url_citation', url: 'https://linux.do/t/topic/123', title: 'Topic' }],
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
