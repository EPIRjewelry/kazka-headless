import {redirect, type LoaderFunctionArgs} from '@remix-run/cloudflare';

export async function loader({params}: LoaderFunctionArgs) {
  return redirect(params?.locale ? `${params.locale}/products` : '/products');
}
