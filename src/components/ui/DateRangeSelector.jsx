import { Select } from './Input'

const presets = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'ytd', label: 'Year to date' },
]

export function DateRangeSelector({ value = '30d', onChange, className }) {
  return (
    <Select
      aria-label="Date range"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      className={className}
    >
      {presets.map((preset) => (
        <option key={preset.value} value={preset.value}>
          {preset.label}
        </option>
      ))}
    </Select>
  )
}
