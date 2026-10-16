'use client';

import React, { useState } from 'react';
import { Topic } from '@winter-arc/shared';
import { Layers, Plus, Trash2, CheckCircle2, Clock, Circle } from 'lucide-react';

interface TopicsBoardProps {
  topics: Topic[];
  onUpdateTopicStatus: (topicId: string, status: Topic['status']) => void;
  onAddTopic: (group: string, text: string) => void;
  onDeleteTopic: (topicId: string) => void;
}

export const TopicsBoard: React.FC<TopicsBoardProps> = ({
  topics,
  onUpdateTopicStatus,
  onAddTopic,
  onDeleteTopic,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [customGroup, setCustomGroup] = useState<string>('');
  const [topicText, setTopicText] = useState<string>('');
  const [isAddingOpen, setIsAddingOpen] = useState(false);

  // Collect distinct groups
  const existingGroups = Array.from(new Set(topics.map((t) => t.group)));
  const defaultGroup = existingGroups[0] || 'CS core';

  // Group topics
  const groupedTopics: Record<string, Topic[]> = {};
  for (const t of topics) {
    if (!groupedTopics[t.group]) {
      groupedTopics[t.group] = [];
    }
    groupedTopics[t.group]?.push(t);
  }

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGroup = customGroup.trim() || selectedGroup || defaultGroup;
    const finalText = topicText.trim();
    if (!finalText) return;

    onAddTopic(finalGroup, finalText);
    setTopicText('');
    setCustomGroup('');
    setIsAddingOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-text flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent-ice" /> Topics & Competencies Board
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Syllabus topics grouped by engineering discipline with status tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedGroup(defaultGroup);
            setIsAddingOpen(!isAddingOpen);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 border border-border-token px-3 py-1.5 text-xs font-mono text-text hover:bg-surface hover:border-accent-ice transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-accent-ice" /> Add Topic
        </button>
      </div>

      {/* Add Topic Drawer / Inline Form */}
      {isAddingOpen && (
        <form
          onSubmit={handleCreateTopic}
          className="rounded-bento border border-accent-ice/30 bg-surface p-4 space-y-3 shadow-md animate-in fade-in duration-150"
        >
          <div className="text-xs font-mono font-semibold uppercase text-accent-ice">
            New Syllabus Topic
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-muted mb-1">Choose Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value);
                  if (e.target.value !== '__new__') {
                    setCustomGroup('');
                  }
                }}
                className="w-full rounded-md border border-border-token bg-surface-2 px-3 py-1.5 text-xs text-text focus:border-accent-ice focus:outline-none"
              >
                {existingGroups.map((grp) => (
                  <option key={grp} value={grp}>
                    {grp}
                  </option>
                ))}
                <option value="__new__">+ Create new group...</option>
              </select>
            </div>

            {selectedGroup === '__new__' && (
              <div>
                <label className="block text-xs font-mono text-muted mb-1">New Group Name</label>
                <input
                  type="text"
                  required
                  value={customGroup}
                  onChange={(e) => setCustomGroup(e.target.value)}
                  placeholder="e.g. Distributed Systems"
                  className="w-full rounded-md border border-border-token bg-surface-2 px-3 py-1.5 text-xs text-text focus:border-accent-ice focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono text-muted mb-1">Topic Description *</label>
            <input
              type="text"
              required
              value={topicText}
              onChange={(e) => setTopicText(e.target.value)}
              placeholder="e.g. Raft consensus protocol, log replication, and leader election"
              className="w-full rounded-md border border-border-token bg-surface-2 px-3 py-1.5 text-xs text-text focus:border-accent-ice focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingOpen(false)}
              className="rounded-md border border-border-token bg-surface-2 px-3 py-1 text-xs font-mono text-muted hover:text-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-accent-ice px-3 py-1 text-xs font-mono font-semibold text-bg hover:bg-accent-ice/90"
            >
              Add Topic
            </button>
          </div>
        </form>
      )}

      {/* Grouped Topics Cards */}
      <div className="space-y-6">
        {Object.entries(groupedTopics).map(([groupName, groupItems]) => {
          const totalInGroup = groupItems.length;
          const doneInGroup = groupItems.filter((t) => t.status === 'done').length;
          const groupPercent =
            totalInGroup > 0 ? Math.round((doneInGroup / totalInGroup) * 100) : 0;

          return (
            <div
              key={groupName}
              className="rounded-bento border border-border-token bg-surface p-5 space-y-4"
            >
              {/* Group Header & Progress */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-token pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-text">{groupName}</h3>
                  <span className="rounded-full bg-surface-2 border border-border-token px-2 py-0.5 text-[10px] font-mono text-muted">
                    {doneInGroup}/{totalInGroup} done
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-28 h-2 rounded-full bg-surface-2 overflow-hidden border border-border-token">
                    <div
                      className={`h-full transition-all ${
                        groupPercent === 100 ? 'bg-status-success' : 'bg-accent-ice'
                      }`}
                      style={{ width: `${groupPercent}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-semibold text-text w-9 text-right">
                    {groupPercent}%
                  </span>
                </div>
              </div>

              {/* Topics List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {groupItems.map((topic) => (
                  <div
                    key={topic.id}
                    className={`flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors ${
                      topic.status === 'done'
                        ? 'border-status-success/30 bg-status-success/5'
                        : topic.status === 'doing'
                          ? 'border-status-warn/40 bg-status-warn/5'
                          : 'border-border-token bg-surface-2/40'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs ${
                          topic.status === 'done'
                            ? 'line-through text-muted'
                            : 'text-text font-medium'
                        }`}
                      >
                        {topic.text}
                      </div>

                      {/* Status Pills */}
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateTopicStatus(topic.id, 'todo')}
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
                            topic.status === 'todo'
                              ? 'bg-surface border border-border-token text-text font-semibold'
                              : 'text-muted/60 hover:text-text'
                          }`}
                        >
                          <Circle className="h-2.5 w-2.5" /> Todo
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateTopicStatus(topic.id, 'doing')}
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
                            topic.status === 'doing'
                              ? 'bg-status-warn/20 border border-status-warn/40 text-status-warn font-semibold'
                              : 'text-muted/60 hover:text-status-warn'
                          }`}
                        >
                          <Clock className="h-2.5 w-2.5" /> Doing
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateTopicStatus(topic.id, 'done')}
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
                            topic.status === 'done'
                              ? 'bg-status-success/20 border border-status-success/40 text-status-success font-semibold'
                              : 'text-muted/60 hover:text-status-success'
                          }`}
                        >
                          <CheckCircle2 className="h-2.5 w-2.5" /> Done
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteTopic(topic.id)}
                      className="text-muted/40 hover:text-status-danger p-1 transition-colors"
                      title="Delete topic"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
