import { Button, Modal } from '../ui'
import { SmsPhonePreview } from '../campaigns/SmsPhonePreview'
import { personalizeSmsBody, smsCategoryLabel } from '../../lib/smsTemplateCatalog'

export function SmsTemplatePreviewModal({
  open,
  template,
  shopName,
  using,
  useLabel = 'Use this',
  onClose,
  onUse,
}) {
  if (!template) return null

  const body = personalizeSmsBody(template.body, {
    shopName,
    firstName: 'Ayesha',
    saleUrl: 'acme.pk/sale',
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={template.name || 'SMS preview'}
      className="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button disabled={using} onClick={() => onUse?.(template)}>
            {using ? 'Working…' : useLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            {smsCategoryLabel(template.category)}
          </p>
          <p className="mt-1 text-sm text-muted">{shopName || 'Your shop'}</p>
        </div>
        <div className="flex justify-center">
          <SmsPhonePreview body={body} shopName={shopName} />
        </div>
      </div>
    </Modal>
  )
}
