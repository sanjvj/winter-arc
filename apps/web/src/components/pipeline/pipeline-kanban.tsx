'use client';

import React, { useState } from 'react';
import { Application, ApplicationStatus, todayIST } from '@winter-arc/shared';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ApplicationCard } from './application-card';
import { updateDocument } from '@/lib/data/mutations';
import { toast } from '@/components/ui/toast';

const COLUMNS: { id: ApplicationStatus; title: string; colorClass: string }[] = [
  { id: 'saved', title: 'Saved', colorClass: 'border-border-token text-muted' },
  { id: 'applied', title: 'Applied', colorClass: 'border-accent-ice/40 text-accent-ice' },
  { id: 'oa', title: 'OA', colorClass: 'border-status-warn/40 text-status-warn' },
  { id: 'interview', title: 'Interview', colorClass: 'border-accent-ice text-accent-ice' },
  { id: 'offer', title: 'Offer', colorClass: 'border-status-success/40 text-status-success' },
  { id: 'rejected', title: 'Rejected', colorClass: 'border-border-token text-muted/60' },
  { id: 'ghosted', title: 'Ghosted', colorClass: 'border-border-token text-muted/60' },
  { id: 'withdrawn', title: 'Withdrawn', colorClass: 'border-border-token text-muted/60' },
];

interface SortableApplicationCardProps {
  application: Application;
  onEdit: (app: Application) => void;
}

const SortableApplicationCard: React.FC<SortableApplicationCardProps> = ({
  application,
  onEdit,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application.id || `${application.company}-${application.role}`,
    data: { application },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ApplicationCard application={application} onEdit={onEdit} isDragging={isDragging} />
    </div>
  );
};

interface DroppableColumnProps {
  column: (typeof COLUMNS)[number];
  applications: Application[];
  onEdit: (app: Application) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ column, applications, onEdit }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const appIds = applications.map((a) => a.id || `${a.company}-${a.role}`);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] w-72 flex-shrink-0 rounded-bento border bg-surface/40 p-3 transition-colors ${
        isOver ? 'border-accent-ice/60 bg-accent-ice/5' : 'border-border-token'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-token mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-semibold uppercase ${column.colorClass}`}>
            {column.title}
          </span>
          <span className="rounded-full bg-surface-2 border border-border-token px-2 py-0.5 text-[10px] font-mono text-muted">
            {applications.length}
          </span>
        </div>
      </div>

      {/* Cards List */}
      <SortableContext items={appIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[160px] pb-2">
          {applications.map((app) => (
            <SortableApplicationCard
              key={app.id || `${app.company}-${app.role}`}
              application={app}
              onEdit={onEdit}
            />
          ))}

          {applications.length === 0 && (
            <div className="h-28 flex items-center justify-center rounded-xl border border-dashed border-border-token text-[11px] font-mono text-muted/50">
              Drop here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

interface PipelineKanbanProps {
  applications: Application[];
  uid: string;
  onEdit: (app: Application) => void;
}

export const PipelineKanban: React.FC<PipelineKanbanProps> = ({ applications, uid, onEdit }) => {
  const [activeApp, setActiveApp] = useState<Application | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // allows clicking to edit without triggering drag
      },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = applications.find((a) => (a.id || `${a.company}-${a.role}`) === active.id);
    if (found) {
      setActiveApp(found);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApp(null);

    if (!over) return;

    const activeId = active.id;
    const draggedApp = applications.find((a) => (a.id || `${a.company}-${a.role}`) === activeId);

    if (!draggedApp || !draggedApp.id) return;

    // Determine target column status:
    // If dropped directly on a column, over.id is the column id.
    // If dropped on another card, find that card's status.
    let targetStatus: ApplicationStatus | null = null;
    const isColumn = COLUMNS.some((c) => c.id === over.id);
    if (isColumn) {
      targetStatus = over.id as ApplicationStatus;
    } else {
      const overApp = applications.find((a) => (a.id || `${a.company}-${a.role}`) === over.id);
      if (overApp) {
        targetStatus = overApp.status;
      }
    }

    if (!targetStatus || targetStatus === draggedApp.status) {
      return;
    }

    const today = todayIST();

    // Spec Invariant: Moving to "applied" sets appliedDate to today if empty
    let updatedAppliedDate = draggedApp.appliedDate;
    if (targetStatus === 'applied' && !updatedAppliedDate) {
      updatedAppliedDate = today;
    }

    // Spec Invariant: Every status change appends to statusHistory
    const updatedHistory = [
      ...(draggedApp.statusHistory || []),
      { status: targetStatus, date: today },
    ];

    const ok = await updateDocument(uid, 'applications', draggedApp.id, {
      status: targetStatus,
      appliedDate: updatedAppliedDate,
      statusHistory: updatedHistory,
    });

    if (ok) {
      toast.success(
        `Moved to ${targetStatus.toUpperCase()}`,
        `${draggedApp.company} — ${draggedApp.role}`,
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
        {COLUMNS.map((col) => {
          const colApps = applications.filter((a) => a.status === col.id);
          return (
            <DroppableColumn key={col.id} column={col} applications={colApps} onEdit={onEdit} />
          );
        })}
      </div>

      <DragOverlay>
        {activeApp ? (
          <div className="rotate-2 scale-105 opacity-90 shadow-2xl">
            <ApplicationCard application={activeApp} onEdit={() => {}} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
