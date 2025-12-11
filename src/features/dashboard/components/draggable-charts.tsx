'use client'

import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboard-store'
import { ClientOnly } from '@/components/ui/client-only'
import {
  UserGrowthChart,
  CountryDistributionChart,
  VehicleInventoryChart,
  BidActivityChart,
} from './charts'

interface DraggableChartProps {
  id: string
  children: React.ReactNode
}

function DraggableChart({ id, children }: DraggableChartProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className='relative'>
      <div
        {...attributes}
        {...listeners}
        className='hover:bg-accent absolute top-4 right-4 z-10 cursor-move rounded-md p-2 transition-colors'
      >
        <GripVertical className='text-muted-foreground h-4 w-4' />
      </div>
      {children}
    </div>
  )
}

interface DraggableChartsContainerProps {
  chartData?: {
    userGrowth?: Array<{ date: string; users: number }>
    countryDistribution?: Array<{ country: string; value: number; code: string }>
    vehicleInventory?: Array<{ status: string; count: number }>
    bidActivity?: Array<{ date: string; bids: number }>
  }
  loading: boolean
}

export function DraggableChartsContainer({ chartData, loading }: DraggableChartsContainerProps) {
  const { widgetOrder, setWidgetOrder } = useDashboardStore()
  const [items, setItems] = React.useState(widgetOrder)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  React.useEffect(() => {
    setItems(widgetOrder)
  }, [widgetOrder])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = items.indexOf(active.id as string)
      const newIndex = items.indexOf(over?.id as string)

      const newOrder = arrayMove(items, oldIndex, newIndex)
      setItems(newOrder)
      setWidgetOrder(newOrder)
    }
  }

  const chartComponents: Record<string, React.ReactNode> = {
    'user-growth': <UserGrowthChart data={chartData?.userGrowth} loading={loading} />,
    'country-distribution': <CountryDistributionChart data={chartData?.countryDistribution} loading={loading} />,
    'vehicle-inventory': (
      <VehicleInventoryChart data={chartData?.vehicleInventory} loading={loading} />
    ),
    'bid-activity': <BidActivityChart data={chartData?.bidActivity} loading={loading} />,
  }

  return (
    <ClientOnly fallback={
      <div className='grid gap-6 md:grid-cols-2'>
        {items.map((id) => (
          <div key={id} className='relative'>
            {chartComponents[id]}
          </div>
        ))}
      </div>
    }>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className='grid gap-6 md:grid-cols-2'>
            {items.map((id) => (
              <DraggableChart key={id} id={id}>
                {chartComponents[id]}
              </DraggableChart>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </ClientOnly>
  )
}
