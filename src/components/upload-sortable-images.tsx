"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
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
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";

export type UploadDragActivator = {
  ref: (element: HTMLElement | null) => void;
  listeners: DraggableSyntheticListeners | undefined;
  attributes: DraggableAttributes;
  isDragging: boolean;
  reorderEnabled: boolean;
};

const pressHoldConstraint = { delay: 200, tolerance: 8 };

const overlayDragActivator: UploadDragActivator = {
  ref: () => {},
  listeners: undefined,
  attributes: {} as DraggableAttributes,
  isDragging: false,
  reorderEnabled: false,
};

function SortableUploadItem({
  index,
  disabled,
  children,
}: {
  index: number;
  disabled?: boolean;
  children: (context: { dragActivator: UploadDragActivator }) => React.ReactNode;
}) {
  const reorderEnabled = !disabled;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    isDragging,
  } = useSortable({
    id: String(index),
    disabled,
    transition: null,
    animateLayoutChanges: () => false,
  });

  const dragActivator: UploadDragActivator = {
    ref: setActivatorNodeRef,
    listeners: reorderEnabled ? listeners : undefined,
    attributes,
    isDragging,
    reorderEnabled,
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0",
        isDragging && "opacity-40",
      )}
    >
      {children({ dragActivator })}
    </div>
  );
}

interface UploadSortableImagesProps {
  count: number;
  disabled?: boolean;
  onReorder: (oldIndex: number, newIndex: number) => void;
  renderItem: (
    index: number,
    context: { dragActivator: UploadDragActivator },
  ) => React.ReactNode;
}

export function UploadSortableImages({
  count,
  disabled,
  onReorder,
  renderItem,
}: UploadSortableImagesProps) {
  const indices = Array.from({ length: count }, (_, index) => index);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

  const handleDragStart = (event: DragStartEvent) => {
    const index = Number(event.active.id);
    if (!Number.isNaN(index)) {
      setActiveIndex(index);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIndex(null);

    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);
    if (
      Number.isNaN(oldIndex) ||
      Number.isNaN(newIndex) ||
      oldIndex < 0 ||
      newIndex < 0 ||
      oldIndex >= count ||
      newIndex >= count
    ) {
      return;
    }

    onReorder(oldIndex, newIndex);
  };

  const handleDragCancel = () => {
    setActiveIndex(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={indices.map(String)}
        strategy={horizontalListSortingStrategy}
      >
        {indices.map((index) => (
          <SortableUploadItem key={index} index={index} disabled={disabled}>
            {(context) => renderItem(index, context)}
          </SortableUploadItem>
        ))}
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeIndex !== null ? (
          <div className="flex-shrink-0 cursor-grabbing shadow-lg">
            {renderItem(activeIndex, { dragActivator: overlayDragActivator })}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export function UploadImageDragSurface({
  dragActivator,
  onTap,
  className,
  children,
}: {
  dragActivator: UploadDragActivator;
  onTap: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [pressPending, setPressPending] = useState(false);
  const { reorderEnabled, listeners, attributes, ref, isDragging } =
    dragActivator;

  useEffect(() => {
    if (isDragging) {
      setPressPending(false);
    }
  }, [isDragging]);

  const l = reorderEnabled ? listeners : undefined;

  return (
    <div
      ref={ref}
      onClick={onTap}
      className={cn(
        className,
        reorderEnabled &&
          "touch-manipulation select-none [-webkit-touch-callout:none]",
        reorderEnabled &&
          pressPending &&
          "ring-2 ring-inset ring-primary-orange/40",
      )}
      {...(reorderEnabled ? attributes : {})}
      {...(l ?? {})}
      onPointerDown={(event) => {
        l?.onPointerDown?.(event);
        if (reorderEnabled) {
          setPressPending(true);
        }
      }}
      onPointerUp={(event) => {
        l?.onPointerUp?.(event);
        setPressPending(false);
      }}
      onPointerCancel={(event) => {
        l?.onPointerCancel?.(event);
        setPressPending(false);
      }}
      onPointerLeave={(event) => {
        l?.onPointerLeave?.(event);
        setPressPending(false);
      }}
      onTouchStart={(event) => {
        l?.onTouchStart?.(event);
        if (reorderEnabled) {
          setPressPending(true);
        }
      }}
      onTouchEnd={(event) => {
        l?.onTouchEnd?.(event);
        setPressPending(false);
      }}
      onTouchCancel={(event) => {
        l?.onTouchCancel?.(event);
        setPressPending(false);
      }}
    >
      {children}
    </div>
  );
}
