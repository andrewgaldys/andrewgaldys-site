import fs from 'node:fs/promises';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';

const configPath = path.resolve('config.js');
const outputPath = path.resolve('data/posts.json');

function extractConfig(text) {
  const match = text.match(/window\.SITE_CONFIG\s*=\s*(\{[\s\S]*\});?/);
  if (!match) throw new Error('Could not parse config.js');
  return Function(`"use strict"; return (${match[1]});`)();
}

const configText = await fs.readFile(configPath, 'utf8');
const config = extractConfig(configText);
const feedUrl = config.substackFeedUrl;

if (!feedUrl || feedUrl.includes('YOUR-SUBSTACK')) {
  throw new Error('Set your real substackFeedUrl in config.js before running the fetch script.');
}

const response = await fetch(feedUrl, {
  headers: { 'User-Agent': 'Mozilla/5.0 AndrewGaldysSiteBot/1.0' }
});

if (!response.ok) {
  throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
}

const xml = await response.text();
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseTagValue: false,
  trimValues: true
});
const parsed = parser.parse(xml);
const channel = parsed?.rss?.channel;
const items = Array.isArray(channel?.item) ? channel.item : (channel?.item ? [channel.item] : []);

const normalized = {
  status: 'ok',
  feed: {
    title: channel?.title || '',
    link: channel?.link || ''
  },
  items: items.map(item => ({
    title: item.title || '',
    link: item.link || '',
    pubDate: item.pubDate || '',
    description: item['content:encoded'] || item.description || ''
  }))
};

await fs.writeFile(outputPath, JSON.stringify(normalized, null, 2));
console.log(`Saved ${normalized.items.length} posts to ${outputPath}`);
