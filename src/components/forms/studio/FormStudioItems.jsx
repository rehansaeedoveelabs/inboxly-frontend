import {
  AtSign,
  Calendar,
  CheckSquare,
  CircleDot,
  ChevronDown,
  Clock3,
  Crown,
  Dices,
  Gift,
  Image as ImageIcon,
  LayoutTemplate,
  MessageSquare,
  Minus,
  MousePointerClick,
  Phone,
  Scale,
  Shuffle,
  Sparkles,
  Square,
  TextCursorInput,
  Type,
} from 'lucide-react'
import { cn } from '../../../lib/cn'

const ITEMS = [
  { type: 'email', label: 'Email', icon: AtSign },
  { type: 'consent', label: 'Legal consent', icon: Scale },
  { type: 'phone', label: 'Phone number', icon: Phone },
  { type: 'text', label: 'Input', icon: TextCursorInput },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { type: 'radio', label: 'Radio button', icon: CircleDot },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'heading', label: 'Text', icon: Type },
  { type: 'button', label: 'Button', icon: MousePointerClick },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'spacer', label: 'Line / Space', icon: Minus },
  { type: 'wheel', label: 'Wheel of fortune', icon: Shuffle, pro: true },
  { type: 'mystery', label: 'Mystery box', icon: Gift, pro: true },
  { type: 'scratch', label: 'Scratch card', icon: Sparkles, pro: true },
  { type: 'plinko', label: 'Plinko', icon: Dices, pro: true },
  { type: 'pick_card', label: 'Pick a card', icon: Square, pro: true, badge: '1' },
  { type: 'countdown', label: 'Countdown timer', icon: Clock3, pro: true },
]

function defaultLabel(type) {
  const map = {
    email: 'Enter your email',
    phone: 'Phone number',
    consent: 'I agree to receive marketing emails',
    text: 'Your answer',
    date: 'Select a date',
    dropdown: 'Choose an option',
    radio: 'Select one',
    checkbox: 'I agree',
    heading: 'Headline text',
    button: 'Continue',
    image: 'Image',
    spacer: 'Spacer',
    wheel: 'Wheel of fortune',
    mystery: 'Mystery box',
    scratch: 'Scratch card',
    plinko: 'Plinko',
    pick_card: 'Pick a card',
    countdown: 'Countdown',
  }
  return map[type] || type
}

export function createFormField(type) {
  const game = ['wheel', 'mystery', 'scratch', 'plinko', 'pick_card', 'countdown'].includes(type)
  return {
    id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    label: defaultLabel(type),
    required: type === 'consent' || type === 'email',
    ...(game ? { props: { prizes: ['5% off', '10% off', '20% off', '30% off'] } } : {}),
  }
}

export function FormStudioItems({ onAdd, disabled }) {
  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-[#2a2a2a] bg-[#1a1a1a] text-white">
      <div className="border-b border-[#2a2a2a] px-4 py-3">
        <h2 className="text-[13px] font-semibold tracking-wide">Items</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <div className="grid grid-cols-2 gap-2">
          {ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.type}
                type="button"
                disabled={disabled}
                onClick={() => onAdd?.(createFormField(item.type))}
                className={cn(
                  'relative flex flex-col items-center gap-2 rounded-lg border border-[#2f2f2f] bg-[#222] px-2 py-3 text-center transition',
                  disabled
                    ? 'cursor-not-allowed opacity-40'
                    : 'hover:border-[#4a4a4a] hover:bg-[#282828]',
                )}
              >
                {item.pro ? (
                  <span className="absolute top-1.5 right-1.5 text-[#a78bfa]">
                    <Crown className="size-3 fill-current" />
                  </span>
                ) : null}
                {item.badge ? (
                  <span className="absolute top-1.5 left-1.5 flex size-4 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
                <Icon className="size-5 text-[#d4d4d4]" strokeWidth={1.5} />
                <span className="text-[10px] leading-tight font-medium text-[#cfcfcf]">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-[#2a2a2a] px-3 py-2.5">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-[#2f2f2f] text-[#cfcfcf] hover:bg-[#282828]"
          title="Layouts"
        >
          <LayoutTemplate className="size-4" />
        </button>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-[#2f2f2f] text-[#cfcfcf] hover:bg-[#282828]"
          title="Comments"
        >
          <MessageSquare className="size-4" />
        </button>
      </div>
    </aside>
  )
}
