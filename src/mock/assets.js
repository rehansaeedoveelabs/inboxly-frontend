/** Image library and brand assets — prototype data only. */

export const images = [
  {
    id: 'img_001',
    name: 'hero-spring.jpg',
    alt: 'Spring collection hero',
    width: 1600,
    height: 900,
    sizeKb: 420,
    uploadedAt: '2026-11-02T09:20:00Z',
    color: '#2878FF',
  },
  {
    id: 'img_002',
    name: 'product-tote.png',
    alt: 'Canvas tote product',
    width: 1200,
    height: 1200,
    sizeKb: 280,
    uploadedAt: '2026-11-05T14:10:00Z',
    color: '#FFA66B',
  },
  {
    id: 'img_003',
    name: 'lifestyle-storefront.jpg',
    alt: 'Storefront lifestyle',
    width: 1800,
    height: 1000,
    sizeKb: 510,
    uploadedAt: '2026-11-08T11:35:00Z',
    color: '#3DDC97',
  },
  {
    id: 'img_004',
    name: 'email-banner.png',
    alt: 'Email banner',
    width: 1200,
    height: 400,
    sizeKb: 190,
    uploadedAt: '2026-11-09T16:00:00Z',
    color: '#A4ADBF',
  },
]

export const brandAssets = {
  logoName: 'oveelab-mark.svg',
  logoPresent: true,
  colors: {
    accent: '#2878FF',
    dark: '#10131C',
    light: '#FFFFFF',
  },
  fonts: {
    headings: 'DM Sans',
    body: 'DM Sans',
  },
  socialLinks: [
    { id: 'soc_1', network: 'Instagram', url: 'https://instagram.com/oveelab.demo' },
    { id: 'soc_2', network: 'X', url: 'https://x.com/oveelab_demo' },
  ],
}

export function getImages() {
  return images
}

export function getImageById(id) {
  return images.find((image) => image.id === id) || null
}

export function getBrandAssets() {
  return brandAssets
}
