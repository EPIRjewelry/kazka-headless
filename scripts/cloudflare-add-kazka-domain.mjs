#!/usr/bin/env node
/**
 * Dodaje kazka.epirbizuteria.pl do projektu kazka-hydrogen-pages.
 * Wymaga: CLOUDFLARE_API_TOKEN
 * Opcjonalnie: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ZONE_ID (dla epirbizuteria.pl – do CNAME)
 *
 * Uruchom: CLOUDFLARE_API_TOKEN=xxx node scripts/cloudflare-add-kazka-domain.mjs
 */
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '73283c24dc79f92edef30dcdbc98f230';
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const PROJECT = 'kazka-hydrogen-pages';
const DOMAIN = 'kazka.epirbizuteria.pl';
const CNAME_TARGET = 'kazka-hydrogen-pages.pages.dev';

if (!TOKEN) {
  console.error('Ustaw CLOUDFLARE_API_TOKEN');
  process.exit(1);
}

async function addCustomDomain() {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/domains`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: DOMAIN }),
    }
  );
  const json = await res.json();
  if (!json.success) {
    if (json.errors?.[0]?.code === 8000013) {
      console.log('Domena już dodana do projektu.');
      return;
    }
    console.error('Pages API error:', json.errors);
    throw new Error(json.errors?.[0]?.message || 'Failed to add domain');
  }
  console.log('Dodano custom domain:', DOMAIN, '->', PROJECT);
}

async function ensureCnameRecord() {
  if (!ZONE_ID) {
    console.log('Pomijam DNS (brak CLOUDFLARE_ZONE_ID). Ustaw rekord CNAME ręcznie:');
    console.log('  kazka.epirbizuteria.pl  CNAME  ->  kazka-hydrogen-pages.pages.dev');
    return;
  }
  const listRes = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?name=${DOMAIN}`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  const listJson = await listRes.json();
  if (!listJson.success) {
    console.error('DNS list error:', listJson.errors);
    return;
  }
  const existing = listJson.result?.[0];
  if (existing) {
    if (existing.type === 'CNAME' && existing.content?.toLowerCase().includes('kazka-hydrogen-pages')) {
      console.log('CNAME już wskazuje na kazka-hydrogen-pages.');
      return;
    }
    const delRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${existing.id}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    if (!delRes.ok) console.warn('Nie udało się usunąć starego rekordu');
  }
  const createRes = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'CNAME',
        name: 'kazka',
        content: CNAME_TARGET,
        ttl: 1,
        proxied: true,
      }),
    }
  );
  const createJson = await createRes.json();
  if (!createJson.success) {
    console.error('DNS create error:', createJson.errors);
    return;
  }
  console.log('Dodano CNAME: kazka.epirbizuteria.pl ->', CNAME_TARGET);
}

async function main() {
  await addCustomDomain();
  await ensureCnameRecord();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
