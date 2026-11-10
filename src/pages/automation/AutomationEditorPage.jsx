import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  PageHeader,
  Button,
  Card,
  Badge,
  FormField,
  Input,
  Select,
  Textarea,
  EmptyState,
} from '../../components/ui'
import {
  getAutomationById,
  getAutomationTemplateById,
} from '../../mock'
import { statusLabel, statusTone } from '../../lib/format'
import { cn } from '../../lib/cn'

const nodeStyles = {
  trigger: 'border-electric bg-electric/10',
  delay: 'border-warning bg-warning/10',
  condition: 'border-cantaloupe bg-cantaloupe/10',
  action: 'border-success bg-success/10',
}

function blankWorkflow(template) {
  if (template) {
    return {
      id: 'auto_new',
      name: template.name,
      status: 'draft',
      trigger: template.name,
      channels: template.channels,
      enrolled: 0,
      revenue: 0,
      nodes: [
        { id: 'n1', type: 'trigger', label: `${template.name} trigger`, x: 120, y: 40, config: {} },
        { id: 'n2', type: 'delay', label: 'Wait 1 hour', x: 120, y: 150, config: { waitMinutes: 60 } },
        {
          id: 'n3',
          type: 'action',
          label: 'Send email',
          x: 120,
          y: 260,
          config: { channel: 'email', subject: 'Follow up' },
        },
      ],
      edges: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3' },
      ],
    }
  }

  return {
    id: 'auto_new',
    name: 'Custom workflow',
    status: 'draft',
    trigger: 'Manual / custom',
    channels: ['email'],
    enrolled: 0,
    revenue: 0,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Custom trigger', x: 120, y: 40, config: {} },
    ],
    edges: [],
  }
}

export function AutomationEditorPage() {
  const { automationId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const existing = automationId && automationId !== 'new' ? getAutomationById(automationId) : null
  const template = getAutomationTemplateById(searchParams.get('template'))

  const [workflow, setWorkflow] = useState(() => existing || blankWorkflow(template))
  const [selectedId, setSelectedId] = useState(workflow.nodes[0]?.id || null)

  const selected = useMemo(
    () => workflow.nodes.find((node) => node.id === selectedId) || null,
    [workflow.nodes, selectedId],
  )

  if (automationId && automationId !== 'new' && !existing) {
    return (
      <EmptyState
        title="Automation not found"
        description="This workflow ID is not in the mock dataset."
        actionLabel="Back to automation"
        onAction={() => navigate('/automation')}
      />
    )
  }

  const updateSelected = (patch) => {
    setWorkflow((current) => ({
      ...current,
      nodes: current.nodes.map((node) =>
        node.id === selectedId ? { ...node, ...patch, config: { ...node.config, ...patch.config } } : node,
      ),
    }))
  }

  const addNode = (type) => {
    const id = `n_${Date.now()}`
    const labels = {
      delay: 'Wait 1 day',
      condition: 'Condition check',
      action: 'Send message',
      trigger: 'Trigger',
    }
    const y = 40 + workflow.nodes.length * 110
    setWorkflow((current) => ({
      ...current,
      nodes: [
        ...current.nodes,
        {
          id,
          type,
          label: labels[type],
          x: 120,
          y,
          config: type === 'action' ? { channel: 'email', subject: '' } : {},
        },
      ],
      edges:
        current.nodes.length > 0
          ? [...current.edges, { from: current.nodes[current.nodes.length - 1].id, to: id }]
          : current.edges,
    }))
    setSelectedId(id)
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/automation" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          Automation
        </Link>
      </div>

      <PageHeader
        title={workflow.name}
        description="Visual workflow canvas prototype — does not execute real automations."
        actions={
          <>
            <Badge tone={statusTone(workflow.status)}>{statusLabel(workflow.status)}</Badge>
            <Button
              variant="secondary"
              onClick={() => alert('Prototype only — workflow status toggled locally.')}
            >
              {workflow.status === 'active' ? 'Pause' : 'Activate'}
            </Button>
            <Button onClick={() => alert('Prototype only — workflow not persisted.')}>Save</Button>
          </>
        }
      />

      <div className="grid gap-3 xl:grid-cols-[1fr_20rem]">
        <Card padding={false} className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
            <Button size="sm" variant="secondary" onClick={() => addNode('delay')}>
              + Delay
            </Button>
            <Button size="sm" variant="secondary" onClick={() => addNode('condition')}>
              + Condition
            </Button>
            <Button size="sm" variant="secondary" onClick={() => addNode('action')}>
              + Action
            </Button>
            <p className="text-xs text-muted">Click a node to edit its settings.</p>
          </div>
          <div className="canvas-dots relative h-[32rem] overflow-auto bg-midnight p-6">
            {workflow.nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedId(node.id)}
                className={cn(
                  'absolute w-48 rounded-lg border px-3 py-2 text-left shadow-sm transition',
                  nodeStyles[node.type] || nodeStyles.action,
                  selectedId === node.id && 'ring-2 ring-electric',
                )}
                style={{ left: node.x, top: node.y }}
              >
                <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                  {node.type}
                </p>
                <p className="text-sm font-medium text-ink">{node.label}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Node settings</h3>
          {!selected ? (
            <p className="text-sm text-muted">Select a node on the canvas.</p>
          ) : (
            <div className="space-y-3">
              <FormField label="Label">
                <Input
                  value={selected.label}
                  onChange={(event) => updateSelected({ label: event.target.value })}
                />
              </FormField>
              <FormField label="Type">
                <Select
                  value={selected.type}
                  onChange={(event) => updateSelected({ type: event.target.value })}
                >
                  <option value="trigger">Trigger</option>
                  <option value="delay">Delay</option>
                  <option value="condition">Condition</option>
                  <option value="action">Action</option>
                </Select>
              </FormField>
              {selected.type === 'delay' && (
                <FormField label="Wait (minutes)">
                  <Input
                    type="number"
                    value={selected.config.waitMinutes || 60}
                    onChange={(event) =>
                      updateSelected({ config: { waitMinutes: Number(event.target.value) } })
                    }
                  />
                </FormField>
              )}
              {selected.type === 'action' && (
                <>
                  <FormField label="Channel">
                    <Select
                      value={selected.config.channel || 'email'}
                      onChange={(event) =>
                        updateSelected({ config: { channel: event.target.value } })
                      }
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                    </Select>
                  </FormField>
                  <FormField label="Subject / message">
                    <Textarea
                      value={selected.config.subject || ''}
                      onChange={(event) =>
                        updateSelected({ config: { subject: event.target.value } })
                      }
                    />
                  </FormField>
                </>
              )}
              {selected.type === 'condition' && (
                <FormField label="Condition notes">
                  <Textarea
                    value={selected.config.notes || ''}
                    onChange={(event) =>
                      updateSelected({ config: { notes: event.target.value } })
                    }
                    placeholder="Describe the branch logic for this prototype."
                  />
                </FormField>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
