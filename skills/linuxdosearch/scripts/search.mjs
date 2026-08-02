const BASE_URL = 'https://api.x.ai/v1';
const MODEL = 'grok-4.5';
const TOOL = { type: 'web_search', filters: { allowed_domains: ['linux.do'] } };
const SEARCH_INSTRUCTION = `Search only pages hosted on linux.do. Search broadly. Read the topic and replies before answering.
Provide a detailed synthesis with as much useful information as the sources support. For every relevant topic, include its date, title, main claims, important reply evidence, and direct linux.do topic URL. Summarize recurring opinions, supporting and conflicting evidence, firsthand experiences, and uncertainty. Distinguish independent user reports from promotional content, affiliate links, and self-promotion. Rank or group findings when the query asks for recommendations. Do not use or cite any other website. Do not return a bare URL list.`;

export async function search(query) {
  const firstResult = await request(query);
  if (firstResult.citations.length > 0) return firstResult;
  return request(query.split(/\s+/).slice(0, 3).join(' '));
}

async function request(query) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error('XAI_API_KEY is required');
  const response = await fetchWithRetry(`${process.env.XAI_BASE_URL || BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.XAI_MODEL || MODEL,
      input: [{ role: 'user', content: `${SEARCH_INSTRUCTION}\n\nQuery: site:linux.do ${query}` }],
      tools: [TOOL],
    }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return result(data);
}

async function fetchWithRetry(url, options) {
  for (let retry = 0; retry <= 3; retry += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok || retry === 3) return response;
      const delay = Number(response.headers?.get?.('retry-after') || 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      if (retry === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

function result(data) {
  const rawCitations = Array.isArray(data.citations) && data.citations.length > 0 ? data.citations : data.output?.flatMap((item) => item.content || []).flatMap((content) => content.annotations || []).filter((annotation) => annotation.type === 'url_citation').map((annotation) => ({ url: annotation.url, title: annotation.title })) || [];
  const outputTypes = (data.output || []).map((item) => item.type);
  const rawContent = (data.output || [])
    .filter((item) => item.type === 'message')
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text' || item.type === 'text')
    .map((item) => item.text)
    .join('\n');
  if (!rawContent && rawCitations.length === 0) throw new Error('empty response from upstream');
  const cleanContent = rawContent.replace(/<grok:render[\s\S]*?<\/grok:render>/g, '').trim();
  const content = cleanContent;
  const inlineCitations = [...content.matchAll(/https:\/\/(?:www\.)?linux\.do\/t\/topic\/\d+/g)].map((match) => ({ url: match[0], title: 'Linux.do topic' }));
  const citations = [...rawCitations, ...inlineCitations].filter((citation, index, items) => items.findIndex((item) => item.url === citation.url) === index);
  const toolUses = data.usage?.num_server_side_tools_used || 0;
  const searchExecuted = toolUses > 0 || outputTypes.includes('web_search_call') || citations.length > 0;
  return { content, citations, search_executed: searchExecuted, output_types: outputTypes };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const query = process.argv.slice(2).join(' ');
  if (!query) throw new Error('query is required');
  console.log(JSON.stringify(await search(query), null, 2));
}
