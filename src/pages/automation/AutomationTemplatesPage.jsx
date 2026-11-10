import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  PageHeader,
  Button,
  SearchInput,
  Card,
  Badge,
} from '../../components/ui'
import { getAutomationTemplates } from '../../mock'

export function AutomationTemplatesPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [goal, setGoal] = useState('all')
  const templates = getAutomationTemplates()

  const goals = useMemo(
    () => ['all', ...new Set(templates.map((item) => item.goal))],
    [templates],
  )

  const filtered = templates.filter((item) => {
    const matchesQuery =
      item.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      item.description.toLowerCase().includes(query.trim().toLowerCase())
    const matchesGoal = goal === 'all' ? true : item.goal === goal
    return matchesQuery && matchesGoal
  })

  return (
    <div>
      <div className="mb-3">
        <Link to="/automation" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          Automation
        </Link>
      </div>

      <PageHeader
        title="Automation templates"
        description="Choose a starting point, then customize on the visual canvas."
        actions={
          <Button variant="secondary" onClick={() => navigate('/automation/new')}>
            Create custom workflow
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row">
        <aside className="w-full shrink-0 rounded-lg border border-line bg-elevated p-3 lg:w-56">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Goals</p>
          <div className="space-y-1">
            {goals.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setGoal(item)}
                className={`flex w-full rounded-md px-2.5 py-2 text-left text-sm ${
                  goal === item ? 'bg-electric/15 text-ink' : 'text-muted hover:bg-secondary'
                }`}
              >
                {item === 'all' ? 'All goals' : item}
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <SearchInput
            className="mb-3 max-w-md"
            placeholder="Search workflows"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((template) => (
              <Card key={template.id} className="flex flex-col">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge tone="accent">{template.badge}</Badge>
                  <div className="flex gap-1">
                    {template.channels.map((channel) => (
                      <Badge key={channel} tone="info">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
                <h3 className="text-base font-semibold text-ink">{template.name}</h3>
                <p className="mt-1 flex-1 text-sm text-muted">{template.description}</p>
                <Button
                  className="mt-4"
                  variant="secondary"
                  onClick={() => navigate(`/automation/new?template=${template.id}`)}
                >
                  Customize workflow
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
