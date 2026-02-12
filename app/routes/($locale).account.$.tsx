import {redirect, type LoaderFunctionArgs} from '@remix-run/cloudflare';

// fallback wild card for all unauthenticated routes in account section
export async function loader({context, params}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  const locale = params.locale;
  return redirect(locale ? `/${locale}/account` : '/account');
}
