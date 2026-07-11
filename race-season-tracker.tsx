import React, { useState, useEffect, useMemo } from "react";
import { Check, Circle, Footprints, Dumbbell, Bike, Flame, Moon, Flag, ChevronDown, ChevronRight } from "lucide-react";

// ---------- Fonts ----------
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
    * { box-sizing: border-box; }
    .font-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.02em; }
    .font-body { font-family: 'Inter', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    button { margin: 0; padding: 0; border: 0; background: none; font: inherit; color: inherit; text-align: inherit; }
  `}</style>
);

// ---------- Palette ----------
// Bright "silver" theme — #EFEFEF base
const C = {
  bg: "#EFEFEF",
  surface: "#FFFFFF",
  surfaceAlt: "#E4E4E4",
  line: "#D2D2D2",
  text: "#1C222E",
  textMute: "#6B7280",
  amber: "#E8860F",
  amberDim: "#C2740A",
  teal: "#0E9C90",
  violet: "#6C56D9",
  red: "#D8412F",
  green: "#1F9D5C",
};

// ---------- Type metadata ----------
const TYPE_META = {
  run: { label: "Run", color: C.amber, icon: Footprints },
  leg: { label: "Heavy Legs", color: C.violet, icon: Dumbbell },
  legLight: { label: "Leg — Power & Hypertrophy", color: C.violet, icon: Dumbbell },
  upper: { label: "Upper Body", color: C.violet, icon: Dumbbell },
  full: { label: "Full Body", color: C.violet, icon: Dumbbell },
  core: { label: "Core/Mobility", color: C.violet, icon: Dumbbell },
  hyrox: { label: "HYROX Circuit", color: C.red, icon: Flame },
  hyroxSat: { label: "Saturday HYROX Circuit", color: C.red, icon: Flame },
  hyroxSatLight: { label: "Saturday HYROX Circuit (Light)", color: C.red, icon: Flame },
  zwiftFun: { label: "Zwift — Structured", color: C.teal, icon: Bike },
  zwiftEasy: { label: "Zwift — Easy Spin", color: C.teal, icon: Bike },
  zwiftBike: { label: "Zwift — Bike Focus", color: C.teal, icon: Bike },
  off: { label: "Off", color: C.textMute, icon: Moon },
  rest: { label: "Rest Day", color: C.textMute, icon: Moon },
  race: { label: "RACE DAY", color: C.red, icon: Flag },
};

// ---------- Date helper ----------
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function shortDow(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

// ---------- Exercise library ----------
// Each type maps to an array of GROUPS: { title: string|null, items: [...] }
// A null title means "no header" (plain exercise list, e.g. a regular lift day)
// weighted: true means the app shows a weight-log field for progressive overload
const EX_LIB = {
  full: [
    {
      title: null,
      items: [
        { name: "Goblet Squat", sets: 3, reps: 12, weighted: true },
        { name: "Push-ups", sets: 3, reps: "10-12", weighted: false },
        { name: "DB Bent-Over Row", sets: 3, reps: 12, weighted: true },
        { name: "Romanian Deadlift", sets: 3, reps: 10, weighted: true },
        { name: "Plank", sets: 3, reps: "40s", weighted: false },
      ],
    },
  ],
  upper: [
    {
      title: null,
      items: [
        { name: "DB Chest Press", sets: 4, reps: 8, weighted: true },
        { name: "Lat Pulldown", sets: 4, reps: 8, weighted: true },
        { name: "Overhead Press", sets: 3, reps: 10, weighted: true },
        { name: "Seated Cable Row", sets: 3, reps: 12, weighted: true },
        { name: "Bicep Curl + Tricep Ext.", sets: 3, reps: 12, weighted: true },
      ],
    },
  ],
  core: [
    {
      title: null,
      items: [
        { name: "Dead Bug", sets: 3, reps: "12/side", weighted: false },
        { name: "Bird Dog", sets: 3, reps: "10/side", weighted: false },
        { name: "Side Plank", sets: 2, reps: "30s/side", weighted: false },
        { name: "Hip Flexor Stretch", sets: 2, reps: "30s/side", weighted: false },
        { name: "Foam Roll Quads/Calves", sets: 1, reps: "5min", weighted: false },
      ],
    },
  ],
  leg: [
    {
      title: null,
      items: [
        { name: "Back Squat", sets: 4, reps: 6, weighted: true },
        { name: "Leg Curl (hamstring focus)", sets: 4, reps: 8, weighted: true },
        { name: "Walking Lunge", sets: 3, reps: "10/leg", weighted: true },
        { name: "Bulgarian Split Squat", sets: 3, reps: "10/leg", weighted: true },
        { name: "Pogo Hops (plyo — calf/ankle stiffness)", sets: 3, reps: 20, weighted: false },
      ],
    },
  ],
  legLight: [
    {
      title: null,
      items: [
        { name: "Leg Press", sets: 3, reps: 15, weighted: true },
        { name: "Hip Thrust", sets: 3, reps: 12, weighted: true },
        { name: "Leg Extension", sets: 3, reps: 15, weighted: true },
        { name: "Box Jump (plyo — leg power)", sets: 3, reps: 8, weighted: false },
        { name: "Pogo Hops (plyo — calf/ankle stiffness)", sets: 3, reps: 20, weighted: false },
      ],
    },
  ],
  hyrox: [
    {
      title: null,
      items: [
        { name: "Sled Push", sets: 4, reps: "20m", weighted: true },
        { name: "Wall Balls", sets: 4, reps: 15, weighted: true },
        { name: "Burpee Broad Jump", sets: 3, reps: 10, weighted: false },
        { name: "Farmer's Carry", sets: 3, reps: "40m", weighted: true },
        { name: "Ski/Row Erg", sets: 3, reps: "500m", weighted: false },
      ],
    },
  ],
  hyroxSat: [
    {
      title: "Main Circuit — 2-3 rounds (500m run between each station)",
      items: [
        { name: "Burpee Broad Jump", sets: "2-3", reps: 15, weighted: false },
        { name: "Row 500m", sets: "2-3", reps: "500m", weighted: false },
        { name: "Farmer's Carry", sets: "2-3", reps: "40m", weighted: true },
        { name: "Lunges", sets: "2-3", reps: "20 total", weighted: true },
        { name: "Wall Ball", sets: "2-3", reps: 20, weighted: true },
      ],
    },
    {
      title: "Finisher — 2 rounds",
      items: [
        { name: "Ski Erg", sets: 2, reps: "300m", weighted: false },
        { name: "Sled Push", sets: 2, reps: "25m", weighted: true },
        { name: "Sled Pull", sets: 2, reps: "25m", weighted: true },
      ],
    },
  ],
  // Lighter version for Phase 0 — still exposes the circuit format, less volume so close to the 5K
  hyroxSatLight: [
    {
      title: "Main Circuit — 1-2 rounds (500m run between each station)",
      items: [
        { name: "Burpee Broad Jump", sets: "1-2", reps: 10, weighted: false },
        { name: "Row 500m", sets: "1-2", reps: "500m", weighted: false },
        { name: "Farmer's Carry", sets: "1-2", reps: "30m", weighted: true },
        { name: "Lunges", sets: "1-2", reps: "16 total", weighted: true },
        { name: "Wall Ball", sets: "1-2", reps: 15, weighted: true },
      ],
    },
    {
      title: "Finisher — 1 round (optional)",
      items: [
        { name: "Ski Erg", sets: 1, reps: "300m", weighted: false },
        { name: "Sled Push", sets: 1, reps: "20m", weighted: true },
        { name: "Sled Pull", sets: 1, reps: "20m", weighted: true },
      ],
    },
  ],
};

// ---------- Session builder ----------
// s(time, type, title) — automatically attaches an exercise list when the type has one
const s = (time, type, title) => {
  const base = { time, type, title: title || TYPE_META[type].label };
  if (EX_LIB[type]) base.exerciseGroups = EX_LIB[type];
  return base;
};

function day(dateOffset, weekStart, sessions) {
  return { date: addDays(weekStart, dateOffset), sessions };
}

// ================= PHASE 0 : 5K PREP =================
const p0w1 = "2026-07-12"; // Sunday
const phase0Week1 = {
  label: "Week 1 — Build",
  days: [
    day(0, p0w1, [s("AM", "run", "1.25mi easy continuous — breathing/form focus"), s("PM", "zwiftEasy", "20-30min optional easy spin")]),
    day(1, p0w1, [s("AM", "run", "1.5mi easy continuous"), s("PM", "core"), s("PM", "zwiftEasy", "20-30min optional easy spin")]),
    day(2, p0w1, [s("AM", "full", "Full-body strength (moderate)"), s("PM", "zwiftEasy", "30min easy spin (Zwift)")]),
    day(3, p0w1, [s("AM", "run", "1.5mi continuous — breathing/form focus"), s("PM", "upper"), s("PM", "zwiftEasy", "20-30min optional easy spin")]),
    day(4, p0w1, [s("AM", "hyrox", "Light HYROX circuit — intro"), s("PM", "zwiftEasy", "30min easy spin (Zwift)")]),
    day(5, p0w1, [s("AM", "run", "1.25mi easy — form focus"), s("PM", "leg", "Introductory leg strength (light)"), s("PM", "zwiftEasy", "20-30min optional easy spin")]),
    day(6, p0w1, [s("AM", "hyroxSatLight", "HYROX Circuit (Light) — 500m run between each station"), s("AM", "run", "2mi — longest continuous attempt this week"), s("PM", "zwiftEasy", "20min optional recovery spin")]),
  ],
};
const p0w2 = "2026-07-19"; // Sunday
const phase0Week2 = {
  label: "Week 2 — Taper",
  days: [
    day(0, p0w2, [s("AM", "run", "1.5mi easy continuous"), s("PM", "zwiftEasy", "15-20min optional easy spin")]),
    day(1, p0w2, [s("AM", "run", "1.25mi easy, shorter"), s("PM", "core", "Light mobility")]),
    day(2, p0w2, [s("AM", "full", "Light full-body strength"), s("PM", "zwiftEasy", "20min easy spin (Zwift)")]),
    day(3, p0w2, [s("AM", "rest")]),
    day(4, p0w2, [s("AM", "run", "1mi shakeout — breathing/form only"), s("PM", "core", "Light mobility (optional)")]),
    day(5, p0w2, [s("AM", "rest", "Light stretching")]),
    day(6, p0w2, [s("AM", "race", "5K RACE — 3.1mi")]),
  ],
};

// ================= PHASE 1 : HYROX PREP =================
const runNames1 = {
  1: ["5km Long Run", "3km Drop Set", "3km Progressive Run", "3km Easy Run"],
  2: ["6km Hilly Progressive Long Run", "3km Rolling 400s", "4km Easy Run", "3km Easy Run"],
  3: ["7km Hilly Long Run", "3km Hill Repeats", "3.5km Progressive Run", "5km Easy Run"],
  4: ["5km Long Run", "3km Rolling 400s", "4km Easy Run", "3.5km Easy Run"],
  5: ["8km Long Run", "4.5km Tempo 2km", "4.5km 1km Repeats", "4km Easy Run"],
  6: ["9km Block Long Run", "5.5km Tempo 2-1", "5km Easy Run", "4.5km Easy Run"],
  7: ["10km Long Run", "5km Pyramid Intervals", "5.5km Rolling 300s", "6km Easy Run"],
};
// pattern A (weeks 1,3,5,7): quality run on Wed, open days Tue/Thu/Sat
function weekPatternA(weekStart, wNum, taper = false) {
  const [longR, qualR, easyFri, easySun] = runNames1[wNum];
  return {
    label: `Week ${wNum}`,
    days: [
      day(0, weekStart, [s("AM", "run", longR), s("PM", "core"), s("PM", "zwiftEasy", "20-30min optional easy spin")]),
      day(1, weekStart, [s("AM", "hyrox", "HYROX-style circuit (moderate)"), s("PM", "zwiftEasy", "30-45min easy spin (Zwift)")]),
      day(2, weekStart, [s("AM", "run", qualR), s("PM", "upper"), s("PM", "zwiftEasy", "20-30min optional easy spin")]),
      day(3, weekStart, [s("AM", "leg", "Heavy leg strength"), s("PM", "zwiftEasy", "30-45min optional easy spin")]),
      day(4, weekStart, [s("AM", "run", easyFri), s("PM", "full", "Light full-body strength"), s("PM", "zwiftEasy", "20-30min optional easy spin")]),
      day(5, weekStart, [s("AM", "hyroxSat", "HYROX Circuit — 500m run between every station, 2-3 rounds + finisher"), s("PM", "zwiftEasy", "30-60min optional recovery spin")]),
      day(6, weekStart, [s("AM", "run", easySun), s("PM", "zwiftEasy", "30-45min active recovery spin (Zwift)")]),
    ],
  };
}
// pattern B (weeks 2,4,6): quality run on Thu, open days Tue/Wed/Sat
function weekPatternB(weekStart, wNum) {
  const [longR, qualR, easyFri, easySun] = runNames1[wNum];
  return {
    label: `Week ${wNum}`,
    days: [
      day(0, weekStart, [s("AM", "run", longR), s("PM", "core"), s("PM", "zwiftEasy", "20-30min optional easy spin")]),
      day(1, weekStart, [s("AM", "hyrox", "HYROX-style circuit (moderate)"), s("PM", "zwiftEasy", "30-45min easy spin (Zwift)")]),
      day(2, weekStart, [s("AM", "leg", "Heavy leg strength"), s("PM", "zwiftEasy", "30-45min optional easy spin")]),
      day(3, weekStart, [s("AM", "run", qualR), s("PM", "upper"), s("PM", "zwiftEasy", "20-30min optional easy spin")]),
      day(4, weekStart, [s("AM", "run", easyFri), s("PM", "full", "Light full-body strength"), s("PM", "zwiftEasy", "20-30min optional easy spin")]),
      day(5, weekStart, [s("AM", "hyroxSat", "HYROX Circuit — 500m run between every station, 2-3 rounds + finisher"), s("PM", "zwiftEasy", "30-60min optional recovery spin")]),
      day(6, weekStart, [s("AM", "run", easySun), s("PM", "zwiftEasy", "30-45min active recovery spin (Zwift)")]),
    ],
  };
}
const phase1Weeks = [
  weekPatternA("2026-07-27", 1),
  weekPatternB("2026-08-03", 2),
  weekPatternA("2026-08-10", 3),
  weekPatternB("2026-08-17", 4),
  weekPatternA("2026-08-24", 5),
  weekPatternB("2026-08-31", 6),
  weekPatternA("2026-09-07", 7),
  {
    label: "Week 8 — HYROX Taper",
    days: [
      day(0, "2026-09-14", [s("AM", "run", "5km On/Off K's"), s("PM", "off")]),
      day(1, "2026-09-14", [s("PM", "zwiftEasy", "20min light spin (Zwift)")]),
      day(2, "2026-09-14", [s("AM", "run", "5.5km Easy Run"), s("PM", "off")]),
      day(3, "2026-09-14", [s("AM", "core", "Light leg mobility only (50% cut)")]),
      day(4, "2026-09-14", [s("AM", "race", "HYROX Mixed Doubles — Salt Lake City")]),
      day(5, "2026-09-14", [s("AM", "rest", "Travel / recovery")]),
      day(6, "2026-09-14", [s("AM", "run", "5km Easy Run"), s("PM", "off")]),
    ],
  },
];

// ================= PHASE 2 : HALF MARATHON BUILD =================
function weekP2(weekStart, wNum, config) {
  return { label: `Week ${wNum}`, days: config.map((d, i) => day(i, weekStart, d)) };
}
const phase2Weeks = [
  weekP2("2026-09-21", 9, [
    [s("AM", "run", "6km Alternating Hill Reps"), s("PM", "upper"), s("PM", "zwiftEasy", "20-30min optional easy spin")],
    [s("AM", "leg", "Heavy leg strength"), s("PM", "zwiftEasy", "30-45min easy spin (Zwift)")],
    [s("AM", "run", "5km Over and Unders 1km"), s("PM", "upper"), s("PM", "zwiftEasy", "20-30min optional easy spin")],
    [s("AM", "full", "Full-body strength"), s("PM", "zwiftBike", "60min bike-focus ride (Zwift)")],
    [s("AM", "run", "12km Hilly Long Run"), s("PM", "upper", "Optional light upper body")],
    [s("AM", "legLight", "Secondary leg day — hypertrophy focus"), s("PM", "zwiftBike", "75min moderate Zwift ride")],
    [s("AM", "run", "7km Easy Run"), s("PM", "zwiftEasy", "30-45min active recovery spin (Zwift)")],
  ]),
  weekP2("2026-09-28", 10, [
    [s("AM", "run", "14km Race Practice Long Run"), s("PM", "upper", "Optional light upper body")],
    [s("AM", "leg", "Heavy leg strength"), s("PM", "zwiftEasy", "30-45min easy spin (Zwift)")],
    [s("AM", "full", "Full-body strength"), s("PM", "zwiftBike", "60min bike-focus ride (Zwift)")],
    [s("AM", "run", "5.6km Tempo 1200s"), s("PM", "upper"), s("PM", "zwiftEasy", "20-30min optional easy spin")],
    [s("AM", "run", "8km Easy Run"), s("PM", "zwiftEasy", "20-30min optional easy spin")],
    [s("AM", "legLight", "Secondary leg day — hypertrophy focus"), s("PM", "zwiftBike", "75min moderate Zwift ride")],
    [s("AM", "run", "5km Easy Run"), s("PM", "zwiftEasy", "30-45min active recovery spin (Zwift)")],
  ]),
  weekP2("2026-10-05", 11, [
    [s("AM", "run", "16km Long Run"), s("PM", "upper", "Optional light upper body")],
    [s("AM", "leg", "Heavy leg strength"), s("PM", "zwiftEasy", "30-45min easy spin (Zwift)")],
    [s("AM", "run", "6.5km Half Easy, Half Tempo"), s("PM", "upper"), s("PM", "zwiftEasy", "20-30min optional easy spin")],
    [s("AM", "full", "Full-body strength"), s("PM", "zwiftBike", "60min bike-focus ride (Zwift)")],
    [s("AM", "run", "7.4km 400s into 200s"), s("PM", "upper")],
    [s("AM", "legLight", "Secondary leg day — hypertrophy focus"), s("PM", "zwiftBike", "75min moderate Zwift ride")],
    [s("AM", "run", "6km Easy Run"), s("PM", "zwiftEasy", "30-45min active recovery spin (Zwift)")],
  ]),
  weekP2("2026-10-12", 12, [
    [s("AM", "run", "14km Hilly Progressive Repeat Long Run"), s("PM", "upper", "Optional light upper body")],
    [s("AM", "leg", "Heavy leg strength"), s("PM", "zwiftEasy", "30-45min easy spin (Zwift)")],
    [s("AM", "full", "Full-body strength"), s("PM", "zwiftBike", "60min bike-focus ride (Zwift)")],
    [s("AM", "run", "6km Tempo 3km"), s("PM", "upper"), s("PM", "zwiftEasy", "20-30min optional easy spin")],
    [s("AM", "run", "7km Easy Run"), s("PM", "zwiftEasy", "20-30min optional easy spin")],
    [s("AM", "legLight", "Secondary leg day — hypertrophy focus"), s("PM", "zwiftBike", "75min moderate Zwift ride")],
    [s("AM", "run", "5km Easy Run"), s("PM", "zwiftEasy", "30-45min active recovery spin (Zwift)")],
  ]),
  weekP2("2026-10-19", 13, [
    [s("AM", "run", "12km Race Practice Long Run"), s("PM", "off")],
    [s("AM", "leg", "Light leg strength (50% cut)"), s("PM", "zwiftEasy", "30-45min easy spin (Zwift)")],
    [s("PM", "zwiftEasy", "30min easy spin (Zwift)")],
    [s("AM", "run", "5km Broken Miles"), s("PM", "off")],
    [s("AM", "run", "6.5km Easy Run"), s("PM", "off")],
    [s("PM", "zwiftEasy", "45min easy-moderate ride (Zwift)")],
    [s("AM", "run", "5.5km Easy Run"), s("PM", "zwiftEasy", "20-30min optional easy spin")],
  ]),
  {
    label: "Week 14 — Race Week",
    days: [
      day(0, "2026-10-26", [s("AM", "rest", "Full rest")]),
      day(1, "2026-10-26", [s("PM", "zwiftEasy", "20min easy spin (optional)")]),
      day(2, "2026-10-26", [s("AM", "run", "5.5km Race Pace Practice K's"), s("PM", "off")]),
      day(3, "2026-10-26", [s("AM", "run", "5km Easy Run"), s("PM", "off")]),
      day(4, "2026-10-26", [s("AM", "rest", "Full rest")]),
      day(5, "2026-10-26", [s("AM", "rest", "Light stretching")]),
      day(6, "2026-10-26", [s("AM", "race", "GOLDEN GATE HALF MARATHON")]),
    ],
  },
];

const PHASES = [
  { key: "p0", title: "5K Prep", sub: "Jul 12 – Jul 25", weeks: [phase0Week1, phase0Week2], raceDate: "2026-07-25", raceName: "5K" },
  { key: "p1", title: "HYROX Prep", sub: "Jul 27 – Sep 18", weeks: phase1Weeks, raceDate: "2026-09-18", raceName: "HYROX — Salt Lake City" },
  { key: "p2", title: "Half Marathon Build", sub: "Sep 21 – Nov 1", weeks: phase2Weeks, raceDate: "2026-11-01", raceName: "Golden Gate Half Marathon" },
];

const RACES = [
  { date: "2026-07-25", name: "5K" },
  { date: "2026-09-18", name: "HYROX — Salt Lake City" },
  { date: "2026-11-01", name: "Golden Gate Half Marathon" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysUntil(dateStr) {
  const today = new Date(todayISO() + "T00:00:00");
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

// ---------- Weight Input (controlled, always reflects saved baseline) ----------
function WeightInput({ name, savedValue, onCommit }) {
  const [val, setVal] = useState(savedValue || "");
  useEffect(() => {
    setVal(savedValue || "");
  }, [savedValue]);
  return (
    <input
      type="text"
      inputMode="decimal"
      value={val}
      placeholder="lbs"
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => {
        if (val && val !== savedValue) onCommit(name, val);
      }}
      onClick={(e) => e.stopPropagation()}
      className="font-mono text-[11px] w-[52px] rounded-md px-1.5 py-1 text-right"
      style={{ backgroundColor: C.bg, border: `1px solid ${C.line}`, color: C.amber, flexShrink: 0 }}
    />
  );
}

// ---------- Session Chip ----------
function flattenGroups(groups) {
  const flat = [];
  groups.forEach((g) => g.items.forEach((it) => flat.push(it)));
  return flat;
}

function SessionChip({ session, dayDate, sessionIdx, doneMap, onToggle, weights, onSetWeight }) {
  const meta = TYPE_META[session.type];
  const Icon = meta.icon;
  const [expanded, setExpanded] = useState(false);

  // Simple sessions (run / bike / off / rest / race) — single tap toggles done
  if (!session.exerciseGroups) {
    const key = `${dayDate}__${sessionIdx}`;
    const done = !!doneMap[key];
    return (
      <button
        onClick={() => onToggle(key)}
        className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors"
        style={{ backgroundColor: done ? meta.color + "22" : C.surfaceAlt, border: `1px solid ${done ? meta.color : C.line}` }}
      >
        {done ? <Check size={14} color={meta.color} strokeWidth={3} style={{ flexShrink: 0 }} /> : <Circle size={13} color={C.textMute} style={{ flexShrink: 0 }} />}
        <Icon size={13} color={meta.color} style={{ flexShrink: 0 }} />
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-wide" style={{ color: C.textMute }}>{session.time}</div>
          <div className="font-body text-[12.5px] leading-tight" style={{ color: done ? C.textMute : C.text, textDecoration: done ? "line-through" : "none" }}>
            {session.title}
          </div>
        </div>
      </button>
    );
  }

  // Strength/HYROX sessions — tap header to expand, each exercise has its own check + weight log
  const flatItems = flattenGroups(session.exerciseGroups);
  const doneCount = flatItems.filter((_, i) => doneMap[`${dayDate}__${sessionIdx}__ex${i}`]).length;
  const allDone = doneCount === flatItems.length;
  let idxCounter = -1;
  return (
    <div className="rounded-md overflow-hidden" style={{ backgroundColor: allDone ? meta.color + "22" : C.surfaceAlt, border: `1px solid ${allDone ? meta.color : C.line}` }}>
      <button onClick={() => setExpanded((e) => !e)} className="w-full flex items-center gap-2 px-2.5 py-2 text-left">
        {allDone ? <Check size={14} color={meta.color} strokeWidth={3} style={{ flexShrink: 0 }} /> : <Circle size={13} color={C.textMute} style={{ flexShrink: 0 }} />}
        <Icon size={13} color={meta.color} style={{ flexShrink: 0 }} />
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-wide" style={{ color: C.textMute }}>{session.time}</div>
          <div className="font-body text-[12.5px] leading-tight" style={{ color: allDone ? C.textMute : C.text }}>{session.title}</div>
        </div>
        <span className="font-mono text-[10px]" style={{ color: C.textMute, flexShrink: 0 }}>{doneCount}/{flatItems.length}</span>
        {expanded ? <ChevronDown size={14} color={C.textMute} /> : <ChevronRight size={14} color={C.textMute} />}
      </button>
      {expanded && (
        <div className="pl-7 pr-2.5 pb-2 flex flex-col" style={{ borderTop: `1px solid ${C.line}` }}>
          {session.exerciseGroups.map((grp, gi) => (
            <div key={gi}>
              {grp.title && (
                <div
                  className="font-mono text-[9.5px] uppercase tracking-wide pt-2.5 pb-1"
                  style={{ color: meta.color }}
                >
                  {grp.title}
                </div>
              )}
              {grp.items.map((ex) => {
                idxCounter++;
                const i = idxCounter;
                const exKey = `${dayDate}__${sessionIdx}__ex${i}`;
                const exDone = !!doneMap[exKey];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-2"
                    style={{ borderBottom: `1px solid ${C.line}` }}
                  >
                    <button onClick={() => onToggle(exKey)} style={{ flexShrink: 0 }}>
                      {exDone ? <Check size={13} color={meta.color} strokeWidth={3} /> : <Circle size={12} color={C.textMute} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-body text-[11px] leading-snug truncate"
                        style={{ color: exDone ? C.textMute : C.text, textDecoration: exDone ? "line-through" : "none" }}
                      >
                        {ex.name}
                      </div>
                      <div className="font-mono text-[11px]" style={{ color: C.textMute }}>
                        {ex.sets} × {ex.reps}
                      </div>
                    </div>
                    {ex.weighted && <WeightInput name={ex.name} savedValue={weights[ex.name]} onCommit={onSetWeight} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Day Row ----------
function DayRow({ dayObj, isToday, doneMap, onToggle, weights, onSetWeight }) {
  return (
    <div
      className="grid gap-1.5 py-2 px-3"
      style={{
        gridTemplateColumns: "40px 1fr",
        borderBottom: `1px solid ${C.line}`,
        backgroundColor: isToday ? C.surfaceAlt : "transparent",
      }}
    >
      <div className="flex flex-col items-start justify-center text-left">
        <div className="font-mono text-[10px]" style={{ color: isToday ? C.amber : C.textMute }}>
          {shortDow(dayObj.date).toUpperCase()}
        </div>
        <div className="font-display text-sm" style={{ color: isToday ? C.amber : C.text }}>
          {new Date(dayObj.date + "T00:00:00").getDate()}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {dayObj.sessions.map((sess, i) => (
          <SessionChip
            key={`${dayObj.date}__${i}`}
            session={sess}
            dayDate={dayObj.date}
            sessionIdx={i}
            doneMap={doneMap}
            onToggle={onToggle}
            weights={weights}
            onSetWeight={onSetWeight}
          />
        ))}
      </div>
    </div>
  );
}

// ---------- Week Block ----------
function WeekBlock({ week, doneMap, onToggle, weights, onSetWeight, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const today = todayISO();
  return (
    <div className="mb-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5"
        style={{ backgroundColor: C.surface }}
      >
        <span className="font-display text-[15px]" style={{ color: C.text }}>
          {week.label}
        </span>
        {open ? <ChevronDown size={16} color={C.textMute} /> : <ChevronRight size={16} color={C.textMute} />}
      </button>
      {open && (
        <div style={{ backgroundColor: C.bg }}>
          {week.days.map((d) => (
            <DayRow key={d.date} dayObj={d} isToday={d.date === today} doneMap={doneMap} onToggle={onToggle} weights={weights} onSetWeight={onSetWeight} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Legend ----------
function Legend() {
  const items = ["run", "leg", "hyrox", "hyroxSat", "zwiftBike", "full"];
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-1 mb-4">
      {items.map((k) => {
        const m = TYPE_META[k];
        return (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
            <span className="font-body text-[11px]" style={{ color: C.textMute }}>
              {m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Main App ----------
export default function App() {
  const [activePhase, setActivePhase] = useState(0);
  const [doneMap, setDoneMap] = useState({});
  const [weights, setWeights] = useState({});
  const [loaded, setLoaded] = useState(false);

  // NOTE: window.storage only works inside a Claude artifact. If you host this
  // code yourself (e.g. GitHub Pages), replace the get/set calls below with
  // localStorage.getItem("race-tracker-done") / localStorage.setItem(...).
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("race-tracker-done", false);
        if (res && res.value) setDoneMap(JSON.parse(res.value));
      } catch (e) {
        // no existing data yet
      }
      try {
        const wres = await window.storage.get("race-tracker-weights", false);
        if (wres && wres.value) setWeights(JSON.parse(wres.value));
      } catch (e) {
        // no existing data yet
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const toggle = async (key) => {
    setDoneMap((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      window.storage.set("race-tracker-done", JSON.stringify(next), false).catch(() => {});
      return next;
    });
  };

  const setWeight = async (name, val) => {
    setWeights((prev) => {
      const next = { ...prev, [name]: val };
      window.storage.set("race-tracker-weights", JSON.stringify(next), false).catch(() => {});
      return next;
    });
  };

  const totalSessions = useMemo(
    () =>
      PHASES.reduce(
        (sum, p) =>
          sum +
          p.weeks.reduce(
            (s2, w) =>
              s2 +
              w.days.reduce((s3, d) => s3 + d.sessions.reduce((s4, sess) => s4 + (sess.exerciseGroups ? sess.exerciseGroups.reduce((g, grp) => g + grp.items.length, 0) : 1), 0), 0),
            0
          ),
        0
      ),
    []
  );
  const completedCount = Object.values(doneMap).filter(Boolean).length;

  const nextRace = useMemo(() => {
    const t = todayISO();
    return RACES.find((r) => r.date >= t) || RACES[RACES.length - 1];
  }, []);
  const nd = daysUntil(nextRace.date);

  const phase = PHASES[activePhase];

  return (
    <div className="min-h-screen font-body" style={{ backgroundColor: C.bg }}>
      <FontImport />
      <div className="max-w-md mx-auto px-4 pt-6 pb-16">
        {/* Hero */}
        <div
          className="rounded-xl p-4 mb-5 relative overflow-hidden"
          style={{ backgroundColor: C.surface, border: `1px solid ${C.line}` }}
        >
          <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: C.amber }}>
            Next Up
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display" style={{ fontSize: 52, lineHeight: 1, color: C.amber }}>
              {nd >= 0 ? nd : 0}
            </span>
            <span className="font-body text-sm" style={{ color: C.textMute }}>
              {nd === 0 ? "TODAY" : "days"}
            </span>
          </div>
          <div className="font-display text-lg mt-1" style={{ color: C.text }}>
            {nextRace.name}
          </div>

          {/* race timeline */}
          <div className="flex items-center gap-1.5 mt-4">
            {RACES.map((r, i) => {
              const passed = r.date < todayISO();
              const isNext = r.date === nextRace.date;
              return (
                <React.Fragment key={r.date}>
                  <div
                    className="rounded-full"
                    style={{
                      width: isNext ? 10 : 7,
                      height: isNext ? 10 : 7,
                      backgroundColor: passed ? C.green : isNext ? C.amber : C.line,
                      flexShrink: 0,
                    }}
                  />
                  {i < RACES.length - 1 && (
                    <div className="flex-1 h-[2px]" style={{ backgroundColor: passed ? C.green : C.line }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px]" style={{ color: C.textMute }}>
              5K
            </span>
            <span className="font-mono text-[9px]" style={{ color: C.textMute }}>
              HYROX
            </span>
            <span className="font-mono text-[9px]" style={{ color: C.textMute }}>
              HALF
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="font-body text-[12px]" style={{ color: C.textMute }}>
            {completedCount} / {totalSessions} sessions logged
          </span>
          <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.surfaceAlt }}>
            <div
              className="h-full"
              style={{ width: `${Math.min(100, (completedCount / totalSessions) * 100)}%`, backgroundColor: C.amber }}
            />
          </div>
        </div>

        {/* Phase tabs */}
        <div className="flex gap-1.5 mb-4">
          {PHASES.map((p, i) => (
            <button
              key={p.key}
              onClick={() => setActivePhase(i)}
              className="flex-1 rounded-lg px-2 py-2 text-center transition-colors"
              style={{
                backgroundColor: activePhase === i ? C.amber : C.surface,
                border: `1px solid ${activePhase === i ? C.amber : C.line}`,
              }}
            >
              <div
                className="font-display text-[12px] leading-tight"
                style={{ color: activePhase === i ? "#FFFFFF" : C.text }}
              >
                {p.title}
              </div>
              <div
                className="font-mono text-[9px] mt-0.5"
                style={{ color: activePhase === i ? "#FFFFFFCC" : C.textMute }}
              >
                {p.sub}
              </div>
            </button>
          ))}
        </div>

        <Legend />

        {!loaded ? (
          <div className="text-center py-10 font-body text-sm" style={{ color: C.textMute }}>
            Loading your progress…
          </div>
        ) : (
          <div>
            {phase.weeks.map((w, i) => (
              <WeekBlock key={w.label} week={w} doneMap={doneMap} onToggle={toggle} weights={weights} onSetWeight={setWeight} defaultOpen={i === 0} />
            ))}
          </div>
        )}

        <div className="text-center mt-6">
          <span className="font-mono text-[10px]" style={{ color: C.textMute }}>
            Tap any session to check it off — your progress is saved automatically.
          </span>
        </div>
      </div>
    </div>
  );
}
