/** Prototype workspace / store data — not persisted. */
export const stores = [
  {
    id: 'store_oveelab',
    name: 'Oveelab Demo',
    domain: 'oveelab-demo.myshopify.com',
    status: 'connected',
  },
  {
    id: 'store_northwind',
    name: 'Northwind Market',
    domain: 'northwind-market.myshopify.com',
    status: 'connected',
  },
]

export const currentUser = {
  id: 'user_rehan',
  name: 'Rehan Saeed',
  email: 'rehan@oveelab.demo',
  role: 'Admin',
}

export function getStores() {
  return stores
}

export function getCurrentUser() {
  return currentUser
}
