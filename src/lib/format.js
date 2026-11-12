export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value || 0)
}

export function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function statusTone(status) {
  const map = {
    sent: 'success',
    active: 'success',
    enabled: 'success',
    completed: 'success',
    subscribed: 'success',
    scheduled: 'info',
    sending: 'info',
    sent: 'success',
    partially_sent: 'warning',
    cancelled: 'neutral',
    draft: 'warning',
    published: 'success',
    paused: 'warning',
    pending: 'warning',
    processing: 'info',
    html: 'info',
    non_subscribed: 'neutral',
    nonsubscribed: 'neutral',
    unsubscribed: 'danger',
    failed: 'danger',
  }
  return map[status] || 'neutral'
}

export function statusLabel(status) {
  if (!status) return 'Unknown'
  return String(status).replaceAll('_', ' ')
}
