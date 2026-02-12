import type {LoaderFunctionArgs} from '@remix-run/cloudflare';

export async function loader({params, request, context}: LoaderFunctionArgs) {
  return context.customerAccount.login();
}
