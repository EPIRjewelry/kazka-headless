#!/usr/bin/env node
/**
 * Lista projektów Cloudflare Pages.
 * Wymaga: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID (lub 73283c24dc79f92edef30dcdbc98f230)
 *
 * Uruchom: CLOUDFLARE_API_TOKEN=xxx node scripts/cloudflare-list-pages-projects.mjs
 */
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '73283c24dc79f92edef30dcdbc98f230';
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!TOKEN) {
  console.error('Ustaw CLOUDFLARE_API_TOKEN');
  process.exit(1);
}

const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects`,
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
const json = await res.json();
if (!json.success) {
  console.error('API error:', json.errors);
  process.exit(1);
}
console.log(JSON.stringify(json.result, null, 2));
