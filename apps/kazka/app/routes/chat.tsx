import {json, useLoaderData} from '@remix-run/react';
import type {LoaderArgs} from '@remix-run/cloudflare';
import {ChatWidget} from '~/components/ChatWidget';

export function meta() {
  return [
    {title: 'Czat – EPIR Art Jewellery'},
    {description: 'Czat z asystentem sklepu EPIR Art Jewellery.'},
  ];
}

export async function loader({context, request}: LoaderArgs) {
  const WORKER_CHAT_URL = 'https://epir-chat-worker.krzysztofdzugaj.workers.dev/api/chat';
  const chatApiUrl = WORKER_CHAT_URL;
  const cartId = await context.session.get('cartId');

  return json({chatApiUrl, cartId});
}

export default function ChatPage() {
  const {chatApiUrl, cartId} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Czat z asystentem</h1>
      <p className="mb-8 text-gray-600">
        Zadaj pytanie o produkty lub usługi. Jesteśmy tu, aby pomóc.
      </p>
      <ChatWidget chatApiUrl={chatApiUrl} cartId={cartId} />
    </div>
  );
}
