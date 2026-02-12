import type {LoaderFunctionArgs} from '@remix-run/cloudflare';

export async function loader({context, params}: LoaderFunctionArgs) {
  return context.customerAccount.authorize();
}
