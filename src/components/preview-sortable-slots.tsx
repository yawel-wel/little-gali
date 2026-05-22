"use client";

import {
  DndContext,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { PreviewSessionPublicView } from "@/lib/preview-session/types";
import {
  displayPosition,
  normalizeDisplayOrder,
} from "@/lib/preview-session/display-order";

type PreviewSlotView = PreviewSessionPublicView["slots"][number];

export type PreviewDragActivator = {
  ref: (element: HTMLElement | null) => void;
  listeners: DraggableSyntheticListeners | undefined;
  attributes: DraggableAttributes;
  isDragging: boolean;
  reorderEnabled: boolean;
};

interface PreviewSortableSlotsProps {
  slots: PreviewSlotView[];
  displayOrder: number[];
  disabled?: boolean;
  onReorder: (displayOrder: number[]) => void;
  renderSlot: (
    slot: PreviewSlotView,
    context: { displayPosition: number; dragActivator: PreviewDragActivator },
  ) => React.ReactNode;
}

const pressHoldConstraint = { delay: 200, tolerance: 8 };

function SortableSlotItem({
  slot,
  displayOrder,
  disabled,
  children,
}: {
  slot: PreviewSlotView;
  displayOrder: number[];
  disabled?: boolean;
  children: (
    context: { displayPosition: number; dragActivator: PreviewDragActivator },
  ) => React.ReactNode;
}) {
  const reorderEnabled = !disabled;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(slot.index),
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const position = displayPosition(slot.index, displayOrder);

  const dragActivator: PreviewDragActivator = {
    ref: setActivatorNodeRef,
    listeners: reorderEnabled ? listeners : undefined,
    attributes,
    isDragging,
    reorderEnabled,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-[9.5rem] flex-shrink-0 snap-center sm:w-[10.5rem] lg:w-[11rem]",
        isDragging && "z-20 opacity-90",
      )}
    >
      {children({ displayPosition: position, dragActivator })}
    </div>
  );
}

export function PreviewSortableSlots({
  slots,
  displayOrder,
  disabled,
  onReorder,
  renderSlot,
}: PreviewSortableSlotsProps) {
  const order = normalizeDisplayOrder(displayOrder);
  const orderedSlots = order
    .map((slotIndex) => slots.find((slot) => slot.index === slotIndex))
    .filter((slot): slot is PreviewSlotView => Boolean(slot));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: pressHoldConstraint,
    }),
    useSensor(TouchSensor, {
      activationConstraint: pressHoldConstraint,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const activeSlotIndex = Number(active.id);
    const overSlotIndex = Number(over.id);
    const oldIndex = order.indexOf(activeSlotIndex);
    const newIndex = order.indexOf(overSlotIndex);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onReorder(arrayMove(order, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={order.map(String)}
        strategy={horizontalListSortingStrategy}
      >
        {orderedSlots.map((slot) => (
          <SortableSlotItem
            key={slot.index}
            slot={slot}
            displayOrder={order}
            disabled={disabled}
          >
            {(context) => renderSlot(slot, context)}
          </SortableSlotItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
