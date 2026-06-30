'use client';

import { Fragment, useRef } from 'react';
import Image from 'next/image';
import type { Fixture } from '@/lib/football-data/types';
import { getOwnership } from '@/lib/bet-tracker/config';

const STAGE_ORDER = ['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];
const STAGE_LABELS: Record<string, string> = {
  LAST_32:        'Round of 32',
  LAST_16:        'Round of 16',
  QUARTER_FINALS: 'Quarter-Finals',
  SEMI_FINALS:    'Semi-Finals',
  FINAL:          'Final',
};

const CARD_H  = 78;
const CARD_W  = 200;
const SLOT_H  = 92;
const COL_GAP = 32;
const SCROLL_STEP = CARD_W + COL_GAP;

// ── Helpers ────────────────────────────────────────────────────────────────────

function Crest({ src, name }: { src: string | null; name: string }) {
  if (!src) return <span className="inline-block h-4 w-4 shrink-0 rounded-sm bg-gray-200 dark:bg-gray-700" />;
  return <Image src={src} alt={name} width={16} height={16} className="shrink-0 object-contain" unoptimized />;
}

function betLabel(teamName: string, stage: string): string {
  const owner = getOwnership(teamName, stage);
  if (owner === 'Sandy') return '(S)';
  if (owner === 'Rahul') return '(R)';
  return '';
}

// ── Match card ─────────────────────────────────────────────────────────────────

function BracketCard({ fixture }: { fixture: Fixture }) {
  const { home, away } = fixture.score.fullTime;
  const isFinished = fixture.status === 'FINISHED';
  const isLive     = fixture.status === 'IN_PLAY' || fixture.status === 'PAUSED';
  const showScore  = isFinished || isLive;

  const homeWon = isFinished && home !== null && away !== null && home > away;
  const awayWon = isFinished && home !== null && away !== null && away > home;

  const date = new Date(fixture.utcDate);
  const dateStr = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const borderCls = isLive
    ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30'
    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900';

  return (
    <div style={{ height: CARD_H }} className={`flex flex-col justify-center rounded-xl border px-2.5 py-2 shadow-sm ${borderCls}`}>
      <p className="mb-1 text-[10px] leading-none text-gray-400">
        {dateStr}, {timeStr}
        {isLive && <span className="ml-1 font-bold text-red-500">● Live</span>}
        {isFinished && <span className="ml-1 text-gray-400">FT</span>}
      </p>
      <div className="flex items-center gap-1 py-0.5">
        <Crest src={fixture.homeTeam.crest} name={fixture.homeTeam.name} />
        <span className={`min-w-0 flex-1 truncate text-xs ${homeWon ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
          {fixture.homeTeam.name}
        </span>
        {betLabel(fixture.homeTeam.name, fixture.stage) && (
          <span className="shrink-0 text-[10px] font-semibold text-amber-500">{betLabel(fixture.homeTeam.name, fixture.stage)}</span>
        )}
        {showScore && home !== null && (
          <span className={`ml-1 shrink-0 tabular-nums text-xs font-bold ${homeWon ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{home}</span>
        )}
      </div>
      <div className="flex items-center gap-1 py-0.5">
        <Crest src={fixture.awayTeam.crest} name={fixture.awayTeam.name} />
        <span className={`min-w-0 flex-1 truncate text-xs ${awayWon ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
          {fixture.awayTeam.name}
        </span>
        {betLabel(fixture.awayTeam.name, fixture.stage) && (
          <span className="shrink-0 text-[10px] font-semibold text-amber-500">{betLabel(fixture.awayTeam.name, fixture.stage)}</span>
        )}
        {showScore && away !== null && (
          <span className={`ml-1 shrink-0 tabular-nums text-xs font-bold ${awayWon ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{away}</span>
        )}
      </div>
    </div>
  );
}

function TBDCard() {
  return (
    <div style={{ height: CARD_H }} className="flex flex-col justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-2.5 py-2 dark:border-gray-700 dark:bg-gray-800/40">
      {[0, 1].map((i) => (
        <div key={i} className="flex items-center gap-1.5 py-0.5">
          <span className="inline-block h-4 w-4 shrink-0 rounded-sm bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-400">TBD</span>
        </div>
      ))}
    </div>
  );
}

// ── SVG connector ──────────────────────────────────────────────────────────────

function Connector({ parentCount, baseSlots, roundIndex }: {
  parentCount: number;
  baseSlots:   number;
  roundIndex:  number;
}) {
  const totalH      = baseSlots * SLOT_H;
  const childSlotH  = SLOT_H * Math.pow(2, roundIndex);
  const parentSlotH = SLOT_H * Math.pow(2, roundIndex + 1);
  const midX        = COL_GAP / 2;

  const d = Array.from({ length: parentCount }, (_, i) => {
    const c0y = (2 * i + 0.5) * childSlotH;
    const c1y = (2 * i + 1.5) * childSlotH;
    const py  = (i + 0.5) * parentSlotH;
    return [
      `M 0 ${c0y} H ${midX}`,
      `M 0 ${c1y} H ${midX}`,
      `M ${midX} ${c0y} V ${c1y}`,
      `M ${midX} ${py} H ${COL_GAP}`,
    ].join(' ');
  }).join(' ');

  return (
    <svg width={COL_GAP} height={totalH} className="shrink-0 overflow-visible">
      <path d={d} fill="none" stroke="#d1d5db" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export function KnockoutBracket({ fixtures }: { fixtures: Fixture[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? SCROLL_STEP : -SCROLL_STEP, behavior: 'smooth' });
  }

  const byStage = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    if (!STAGE_ORDER.includes(f.stage)) continue;
    const list = byStage.get(f.stage) ?? [];
    list.push(f);
    byStage.set(f.stage, list);
  }

  const stages = STAGE_ORDER.filter((s) => byStage.has(s));
  if (stages.length === 0) return <p className="text-sm text-gray-400">No knockout fixtures yet.</p>;

  for (const list of byStage.values()) list.sort((a, b) => a.utcDate.localeCompare(b.utcDate));

  const baseSlots = byStage.get(stages[0])!.length;
  const totalH    = baseSlots * SLOT_H;

  return (
    <div>
      {/* Nav buttons — hidden on touch devices, shown on md+ */}
      <div className="mb-2 hidden items-center justify-end gap-2 md:flex">
        <button
          onClick={() => scroll('left')}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-lg shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          aria-label="Scroll left"
        >
          ‹
        </button>
        <button
          onClick={() => scroll('right')}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-lg shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>

      {/* Scroll hint text on mobile */}
      <p className="mb-2 text-right text-xs text-gray-400 md:hidden">← swipe to see more →</p>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overscroll-x-contain pb-4"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        <div className="inline-flex items-start px-1">
          {stages.map((stage, si) => {
            const stageFixtures = byStage.get(stage)!;
            const slotH = SLOT_H * Math.pow(2, si);

            const expectedCount = Math.ceil(baseSlots / Math.pow(2, si));
            const padded: (Fixture | null)[] = [...stageFixtures];
            while (padded.length < expectedCount) padded.push(null);

            return (
              <Fragment key={stage}>
                <div className="shrink-0" style={{ width: CARD_W }}>
                  <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                    {STAGE_LABELS[stage] ?? stage}
                  </p>
                  <div className="relative" style={{ height: totalH }}>
                    {padded.map((fixture, i) => (
                      <div
                        key={fixture?.id ?? `tbd-${i}`}
                        style={{ position: 'absolute', top: (i + 0.5) * slotH - CARD_H / 2, width: CARD_W }}
                      >
                        {fixture ? <BracketCard fixture={fixture} /> : <TBDCard />}
                      </div>
                    ))}
                  </div>
                </div>

                {si < stages.length - 1 && (
                  <div style={{ marginTop: 28 }}>
                    <Connector
                      parentCount={byStage.get(stages[si + 1])!.length}
                      baseSlots={baseSlots}
                      roundIndex={si}
                    />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
