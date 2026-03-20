import { Suspense } from 'react';
import ShopClient from './ShopClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando tienda...</div>}>
      <ShopClient />
    </Suspense>
  );
}
