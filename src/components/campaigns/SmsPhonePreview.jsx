import { IPhone16ProMaxFrame } from '../emailTemplates/IPhone16ProMaxFrame'

/**
 * SMS bubble preview inside an iPhone 16 Pro Max frame.
 */
export function SmsPhonePreview({ body, shopName }) {
  const text = (body || '').trim() || 'Your SMS message will appear here…'

  return (
    <IPhone16ProMaxFrame className="max-w-[360px]">
      <div className="flex h-full flex-col bg-[#f2f2f7]">
        <div className="border-b border-black/5 bg-white/90 px-4 py-2 text-center backdrop-blur">
          <p className="text-[11px] font-semibold text-slate-800">{shopName || 'Your shop'}</p>
          <p className="text-[10px] text-slate-500">Text Message</p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          <p className="text-center text-[10px] text-slate-400">Today</p>
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#2878FF] px-3.5 py-2.5 text-[13px] leading-snug text-white shadow-sm">
            <p className="whitespace-pre-wrap break-words">{text}</p>
          </div>
        </div>
      </div>
    </IPhone16ProMaxFrame>
  )
}
