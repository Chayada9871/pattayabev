Upload images here using these folders:

- `public/images/branding`
  Use for logo, favicon source, wordmark, and brand marks.
- `public/images/hero`
  Use for homepage banners, hero backgrounds, and promo graphics.
- `public/images/categories`
  Use for category tiles like wine, spirits, minibar, and budget collections.
- `public/images/brands`
  Use for supplier and brand logos.
- `public/images/products`
  Use for bottle photos, pack shots, and product detail images.

Examples in Next.js:

- `/images/branding/logo.png`
- `/images/hero/home-banner.jpg`
- `/images/products/macallan-12.png`

In React/Next components you can use:

```tsx
import Image from "next/image";

<Image src="/images/branding/logo.png" alt="PattayaBev logo" width={120} height={48} />
```
