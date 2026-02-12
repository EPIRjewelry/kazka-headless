// @ts-ignore
// Virtual entry point for the app - Cloudflare Workers adapter
import * as remixBuild from 'virtual:remix/server-build';
import {createRequestHandler} from '@remix-run/cloudflare';
import {
  cartGetIdDefault,
  cartSetIdDefault,
  createCartHandler,
  createStorefrontClient,
  storefrontRedirect,
  createCustomerAccountClient,
} from '@shopify/hydrogen';

import {AppSession} from '~/lib/session.server';
import {getLocaleFromRequest} from '~/lib/utils';

/**
 * Storefront headers for Cloudflare Workers (replaces getStorefrontHeaders from Oxygen)
 */
function getStorefrontHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  const cookie = request.headers.get('cookie');
  if (cookie) headers.cookie = cookie;
  const purpose = request.headers.get('purpose');
  if (purpose) headers.purpose = purpose;
  const buyerIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '';
  if (buyerIp) headers['Shopify-Storefront-Buyer-IP'] = buyerIp;
  return headers;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    try {
      if (!env?.SESSION_SECRET) {
        throw new Error('SESSION_SECRET environment variable is not set');
      }

      const waitUntil = executionContext.waitUntil.bind(executionContext);
      const [cache, session] = await Promise.all([
        caches.open('hydrogen'),
        AppSession.init(request, [env.SESSION_SECRET]),
      ]);

      const {storefront} = createStorefrontClient({
        cache,
        waitUntil,
        i18n: getLocaleFromRequest(request),
        publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
        storeDomain: env.PUBLIC_STORE_DOMAIN,
        storefrontId: env.PUBLIC_STOREFRONT_ID,
        storefrontHeaders: getStorefrontHeaders(request),
      });

      const customerAccount = createCustomerAccountClient({
        waitUntil,
        request,
        session,
        customerAccountId: env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
        shopId: env.SHOP_ID,
      });

      const cart = createCartHandler({
        storefront,
        customerAccount,
        getCartId: cartGetIdDefault(request.headers),
        setCartId: cartSetIdDefault(),
      });

      const handleRequest = createRequestHandler({
        build: remixBuild,
        mode: process.env.NODE_ENV as 'development' | 'production',
        getLoadContext: () => ({
          session,
          waitUntil,
          storefront,
          customerAccount,
          cart,
          env,
        }),
      });

      // Cloudflare: serve static assets from [assets] binding
      const url = new URL(request.url);
      if (
        env.ASSETS &&
        (url.pathname.startsWith('/assets/') ||
          url.pathname === '/favicon.ico' ||
          url.pathname === '/oxygen.json')
      ) {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) return assetResponse;
      }

      const response = await handleRequest(request);

      if (session.isPending) {
        response.headers.set('Set-Cookie', await session.commit());
      }

      if (response.status === 404) {
        return storefrontRedirect({request, response, storefront});
      }

      return response;
    } catch (error) {
      console.error(error);
      return new Response('An unexpected error occurred', {status: 500});
    }
  },
};
