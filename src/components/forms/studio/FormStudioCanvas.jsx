import { X } from 'lucide-react'
import { cn } from '../../../lib/cn'
import {
  FormCountdown,
  FormMysteryBoxes,
  FormScratchCard,
  FormWheel,
} from './FormWheel'

const GAME_TYPES = new Set(['wheel', 'mystery', 'scratch', 'plinko', 'pick_card', 'countdown'])
const INPUT_TYPES = new Set(['email', 'phone', 'consent', 'text', 'date', 'dropdown', 'radio', 'checkbox'])

function GameBlock({ field, accent }) {
  if (field.type === 'wheel') {
    return <FormWheel accent={accent} size={210} segments={field.props?.prizes} />
  }
  if (field.type === 'mystery') return <FormMysteryBoxes accent={accent} />
  if (field.type === 'scratch') return <FormScratchCard accent={accent} />
  if (field.type === 'countdown') return <FormCountdown accent={accent} />
  if (field.type === 'plinko' || field.type === 'pick_card') {
    return (
      <div
        className="flex h-40 w-full items-center justify-center rounded-xl text-sm font-semibold text-white"
        style={{ background: accent }}
      >
        {field.label}
      </div>
    )
  }
  return null
}

function FieldPreview({ field, selected, onSelect, accent }) {
  if (GAME_TYPES.has(field.type)) return null

  if (field.type === 'heading') {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(field.id)}
        className={cn('w-full text-left text-base font-bold', selected && 'ring-2 ring-[#14b8a6] ring-offset-2')}
      >
        {field.label}
      </button>
    )
  }
  if (field.type === 'button') {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(field.id)}
        className={cn(
          'h-10 w-full rounded-md text-sm font-semibold text-white',
          selected && 'ring-2 ring-[#14b8a6] ring-offset-2',
        )}
        style={{ background: accent }}
      >
        {field.label}
      </button>
    )
  }
  if (field.type === 'image') {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(field.id)}
        className={cn(
          'flex h-24 w-full items-center justify-center rounded-md border border-dashed border-black/20 text-xs text-black/40',
          selected && 'ring-2 ring-[#14b8a6] ring-offset-2',
        )}
      >
        Image
      </button>
    )
  }
  if (field.type === 'spacer') {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(field.id)}
        className={cn('h-6 w-full border-t border-black/10', selected && 'ring-2 ring-[#14b8a6] ring-offset-2')}
        aria-label="Spacer"
      />
    )
  }
  if (field.type === 'consent' || field.type === 'checkbox') {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(field.id)}
        className={cn(
          'flex w-full items-start gap-2 text-left text-[11px] text-black/70',
          selected && 'ring-2 ring-[#14b8a6] ring-offset-2 rounded',
        )}
      >
        <span className="mt-0.5 size-3.5 shrink-0 rounded border border-black/25 bg-white" />
        <span>{field.label}</span>
      </button>
    )
  }
  if (field.type === 'radio') {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(field.id)}
        className={cn(
          'flex w-full items-center gap-2 text-left text-[12px] text-black/70',
          selected && 'ring-2 ring-[#14b8a6] ring-offset-2 rounded',
        )}
      >
        <span className="size-3.5 rounded-full border border-black/25" />
        <span>{field.label}</span>
      </button>
    )
  }

  const inputType =
    field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'date' ? 'date' : 'text'

  return (
    <button
      type="button"
      onClick={() => onSelect?.(field.id)}
      className={cn('w-full text-left', selected && 'ring-2 ring-[#14b8a6] ring-offset-2 rounded-md')}
    >
      {field.type === 'dropdown' ? (
        <div className="flex h-10 w-full items-center justify-between rounded-md border border-black/15 bg-white px-3 text-sm text-black/45">
          <span>{field.label}</span>
          <span>▾</span>
        </div>
      ) : (
        <input
          readOnly
          type={inputType}
          placeholder={field.label}
          className="pointer-events-none h-10 w-full rounded-md border border-black/15 bg-white px-3 text-sm text-black"
        />
      )}
    </button>
  )
}

export function FormStudioCanvas({
  form,
  step,
  device,
  selectedFieldId,
  onSelectField,
  onSelectHeadline,
  contentSelected,
}) {
  const accent = form.theme?.accent || '#C41E3A'
  const background = form.theme?.background || '#FFFFFF'
  const text = form.theme?.text || '#10131C'
  const gameField = (form.fields || []).find((field) => GAME_TYPES.has(field.type))
  const contentFields = (form.fields || []).filter((field) => !GAME_TYPES.has(field.type))
  const split = form.layout === 'split' || Boolean(gameField)
  const width = device === 'mobile' ? 360 : split ? 720 : 420

  const isSuccess = step === 'success'
  const headline = isSuccess ? form.success?.headline : form.headline
  const subheadline = isSuccess ? form.success?.subheadline : form.subheadline
  const buttonLabel = isSuccess ? form.success?.buttonLabel : form.buttonLabel

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-auto bg-[#2b2b2b] p-6">
      <div
        className="relative overflow-hidden rounded-xl shadow-2xl"
        style={{ width, maxWidth: '100%', background, color: text }}
      >
        <button
          type="button"
          className="absolute top-3 right-3 z-10 flex size-7 items-center justify-center rounded-full text-black/45 hover:bg-black/5"
          aria-label="Close preview"
        >
          <X className="size-4" />
        </button>

        <div className={cn('grid gap-0', split && !isSuccess ? 'md:grid-cols-2' : 'grid-cols-1')}>
          <div className="space-y-3 p-6 sm:p-8">
            <button
              type="button"
              onClick={onSelectHeadline}
              className={cn(
                'w-full text-left text-[26px] leading-[1.15] font-extrabold tracking-tight uppercase',
                contentSelected === 'headline' && 'ring-2 ring-[#14b8a6] ring-offset-2 rounded',
              )}
              style={{ color: text }}
            >
              {headline || 'Headline'}
            </button>
            <button
              type="button"
              onClick={onSelectHeadline}
              className={cn(
                'w-full text-left text-[13px] leading-relaxed opacity-75',
                contentSelected === 'subheadline' && 'ring-2 ring-[#14b8a6] ring-offset-2 rounded',
              )}
            >
              {subheadline || 'Subheadline'}
            </button>

            {!isSuccess ? (
              <div className="space-y-2.5 pt-1">
                {contentFields
                  .filter((field) => INPUT_TYPES.has(field.type) || ['heading', 'image', 'spacer'].includes(field.type))
                  .map((field) => (
                    <FieldPreview
                      key={field.id}
                      field={field}
                      accent={accent}
                      selected={selectedFieldId === field.id}
                      onSelect={onSelectField}
                    />
                  ))}
                <button
                  type="button"
                  onClick={() => onSelectField?.('__button__')}
                  className={cn(
                    'h-11 w-full rounded-md text-sm font-bold tracking-wide text-white uppercase',
                    selectedFieldId === '__button__' && 'ring-2 ring-[#14b8a6] ring-offset-2',
                  )}
                  style={{ background: accent }}
                >
                  {buttonLabel || 'Subscribe'}
                </button>
                {contentFields
                  .filter((field) => field.type === 'button')
                  .map((field) => (
                    <FieldPreview
                      key={field.id}
                      field={field}
                      accent={accent}
                      selected={selectedFieldId === field.id}
                      onSelect={onSelectField}
                    />
                  ))}
              </div>
            ) : (
              <button
                type="button"
                className="mt-4 h-11 w-full rounded-md text-sm font-bold text-white"
                style={{ background: accent }}
              >
                {buttonLabel || 'Continue'}
              </button>
            )}
          </div>

          {split && !isSuccess && gameField ? (
            <div className="relative flex items-center justify-center bg-[#f7f7f7] p-6">
              <span className="absolute top-3 left-3 rounded-md bg-[#14b8a6] px-2 py-0.5 text-[10px] font-semibold text-white">
                {gameField.label || 'Wheel of fortune'}
              </span>
              <button
                type="button"
                onClick={() => onSelectField?.(gameField.id)}
                className={cn(
                  'rounded-xl p-2',
                  selectedFieldId === gameField.id && 'ring-2 ring-[#14b8a6] ring-offset-2',
                )}
              >
                <GameBlock field={gameField} accent={accent} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
