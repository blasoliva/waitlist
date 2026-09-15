import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Party, Table } from '../types'
import { PartyCard } from './PartyCard'

interface QueueListProps {
  parties: Party[]
  availableTables: Table[]
  onReorder: (orderedIds: string[]) => void
  onNotify: (id: string) => void
  onSeat: (id: string, tableId: string) => void
  onRemove: (id: string) => void
}

function SortablePartyCard({ party, availableTables, onNotify, onSeat, onRemove }: {
  party: Party
  availableTables: Table[]
  onNotify: (id: string) => void
  onSeat: (id: string, tableId: string) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: party.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <PartyCard
        party={party}
        availableTables={availableTables}
        onNotify={onNotify}
        onSeat={onSeat}
        onRemove={onRemove}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  )
}

export function QueueList({ parties, availableTables, onReorder, onNotify, onSeat, onRemove }: QueueListProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = parties.findIndex((p) => p.id === active.id)
    const newIndex = parties.findIndex((p) => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = [...parties]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    onReorder(reordered.map((p) => p.id))
  }

  if (parties.length === 0) {
    return <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-400">No parties waiting.</p>
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={parties.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {parties.map((party) => (
            <SortablePartyCard
              key={party.id}
              party={party}
              availableTables={availableTables}
              onNotify={onNotify}
              onSeat={onSeat}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
