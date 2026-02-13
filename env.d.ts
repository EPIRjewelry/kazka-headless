/// <reference types="vite/client" />
/// <reference types="@remix-run/cloudflare" />

import type {
  WithCache,
  HydrogenCart,
  HydrogenSessionData,
} from '@shopify/hydrogen';
import type {Storefront, CustomerAccount} from '~/lib/type';
import type {AppSession} from '~/lib/session.server';

declare global {
  const process: {env: {NODE_ENV: 'production' | 'development'}};

  interface Env {
    ASSETS?: {fetch: (req: Request) => Promise<Response>};
    NODE_ENV?: 'production' | 'development';
    SESSION_SECRET: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PRIVATE_STOREFRONT_API_TOKEN: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_URL: string;
    PUBLIC_CHECKOUT_DOMAIN: string;
    SHOP_ID: string;
  }
}

declare module '@remix-run/cloudflare' {
  export interface AppLoadContext {
    waitUntil: ExecutionContext['waitUntil'];
    session: AppSession;
    storefront: Storefront;
    customerAccount: CustomerAccount;
    cart: HydrogenCart;
    env: Env;
  }

  interface SessionData extends HydrogenSessionData {}
}

export {};
