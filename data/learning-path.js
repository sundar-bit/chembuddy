// ChemBuddy - Learning Path (Somaiya University, Chemical Engineering)
//
// Level 1 — Basic Equipment: 10 modules, 24 equipment found in most chemical
// plants and refineries, 2–3 equipment per module (one a week for 24 weeks). Everything else in
// equipmentDB is Level 2 (shown in Browse, not part of the path yet).
//
// Weekly release (see `schedule` below): one equipment opens each Monday, in
// path order, and stays open — a student who misses a week can catch up.
// Until a start date is set, the path is self-paced: every module is open and,
// inside a module, the next equipment unlocks once the previous one is studied.
//
// One quiz per equipment (10 questions, that equipment only — never mixed).
// Quiz results are stored under the equipment id: progress/<uid>/quizzes/<equipId>
//
// Equipment names are kept here (not looked up from equipmentDB) because
// admin.html loads this file without the equipment database.

const learningPath = {
    level: 1,
    title: 'Level 1 — Basic Equipment',
    description: 'Core equipment found in most chemical plants and refineries. Study at your own pace — one quiz per equipment.',
    quizLength: 10,

    // Change the pace here — no other code changes needed.
    //   startDate:  the first Monday, 'YYYY-MM-DD'; null = self-paced (no schedule)
    //   perWeek:    how many equipment open each week (1, 2, 3 …)
    //   pauseWeeks: Mondays of weeks when nothing new opens (exams, holidays),
    //               e.g. ['2026-12-07', '2026-12-14']
    schedule: {
        startDate: null,
        perWeek: 1,
        pauseWeeks: []
    },

    modules: [
        {
            id: 1,
            title: 'Pumps',
            categoryId: 'pumps',
            description: 'Moving liquids — the centrifugal workhorse and the positive-displacement reciprocating pump.',
            equipment: [
                { id: 'centrifugal-pump', name: 'Centrifugal Pumps' },
                { id: 'reciprocating-pump', name: 'Reciprocating Pumps' }
            ]
        },
        {
            id: 2,
            title: 'Compressors & Blowers',
            categoryId: 'compressors',
            description: 'Raising gas pressure — dynamic and positive-displacement compression.',
            equipment: [
                { id: 'centrifugal-compressor', name: 'Centrifugal Compressors' },
                { id: 'reciprocating-compressor', name: 'Reciprocating Compressors' }
            ]
        },
        {
            id: 3,
            title: 'Heat Exchangers',
            categoryId: 'heat-exchangers',
            description: 'Transferring heat between process streams, water and air.',
            equipment: [
                { id: 'shell-tube', name: 'Shell and Tube Heat Exchangers' },
                { id: 'air-cooled', name: 'Air Cooled Heat Exchangers' }
            ]
        },
        {
            id: 4,
            title: 'Valves',
            categoryId: 'piping',
            description: 'Isolating, throttling and automatically controlling flow.',
            equipment: [
                { id: 'gate-valve', name: 'Gate Valves' },
                { id: 'globe-valve', name: 'Globe Valves' },
                { id: 'control-valve', name: 'Control Valves' }
            ]
        },
        {
            id: 5,
            title: 'Columns',
            categoryId: 'columns',
            description: 'Separating mixtures by vapour–liquid contact on trays and packing.',
            equipment: [
                { id: 'distillation', name: 'Distillation Columns' },
                { id: 'packed-column', name: 'Packed Columns' }
            ]
        },
        {
            id: 6,
            title: 'Reactors',
            categoryId: 'reactors',
            description: 'Where the chemistry happens — batch, continuous stirred and catalytic fixed bed.',
            equipment: [
                { id: 'batch-reactor', name: 'Batch Reactors' },
                { id: 'cstr', name: 'CSTR (Continuous Stirred Tank Reactor)' },
                { id: 'fixed-bed', name: 'Fixed Bed Reactors' }
            ]
        },
        {
            id: 7,
            title: 'Storage Tanks',
            categoryId: 'storage',
            description: 'Holding liquids and gases safely — atmospheric, floating roof and pressurised.',
            equipment: [
                { id: 'atmospheric-tank', name: 'Atmospheric Storage Tanks' },
                { id: 'floating-roof-tank', name: 'Floating Roof Tanks' },
                { id: 'pressure-vessel', name: 'Pressure Storage Vessels' }
            ]
        },
        {
            id: 8,
            title: 'Fired Heaters',
            categoryId: 'fired-heaters',
            description: 'Burning fuel to heat process fluids.',
            equipment: [
                { id: 'cabin-heater', name: 'Cabin/Box Heaters' },
                { id: 'cylindrical-heater', name: 'Cylindrical Heaters' }
            ]
        },
        {
            id: 9,
            title: 'Safety',
            categoryId: 'safety',
            description: 'Protecting people and plant from overpressure and runaway events.',
            equipment: [
                { id: 'relief-valve', name: 'Pressure Relief Valves' },
                { id: 'rupture-disc', name: 'Rupture Discs' }
            ]
        },
        {
            id: 10,
            title: 'Separation',
            categoryId: 'solid-liquid',
            description: 'Removing solids from gases and liquids.',
            equipment: [
                { id: 'cyclone-separator', name: 'Cyclone Separators' },
                { id: 'filter-press', name: 'Filter Presses' },
                { id: 'centrifuge-decanter', name: 'Decanter Centrifuges' }
            ]
        }
    ]
};

// Find the module an equipment belongs to, and its position in that module.
// Returns { module, index } or null if the equipment is not in Level 1.
learningPath.findEquipment = function (equipId) {
    for (var m = 0; m < this.modules.length; m++) {
        var list = this.modules[m].equipment;
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === equipId) return { module: this.modules[m], index: i };
        }
    }
    return null;
};

// All Level 1 equipment in path order: [{ id, name, moduleId, moduleTitle }]
learningPath.allEquipment = function () {
    var out = [];
    this.modules.forEach(function (mod) {
        mod.equipment.forEach(function (eq) {
            out.push({ id: eq.id, name: eq.name, moduleId: mod.id, moduleTitle: mod.title });
        });
    });
    return out;
};

// --- Weekly release -------------------------------------------------------

function parseLocalDate(ymd) {
    var p = ymd.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
}

function localDateStr(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

learningPath.hasSchedule = function () {
    return !!(this.schedule && this.schedule.startDate);
};

// Opening day of each release week, skipping pause weeks: [Date, Date, …]
learningPath.releaseWeeks = function () {
    var s = this.schedule;
    var total = this.allEquipment().length;
    var perWeek = Math.max(1, s.perWeek || 1);
    var needed = Math.ceil(total / perWeek);
    var pauses = s.pauseWeeks || [];
    var weeks = [];
    var d = parseLocalDate(s.startDate);
    while (weeks.length < needed) {
        if (pauses.indexOf(localDateStr(d)) === -1) weeks.push(new Date(d));
        d.setDate(d.getDate() + 7);
    }
    return weeks;
};

// The day an equipment opens (local midnight), or null when there is no schedule.
learningPath.releaseDate = function (equipId) {
    if (!this.hasSchedule()) return null;
    var all = this.allEquipment();
    for (var i = 0; i < all.length; i++) {
        if (all[i].id === equipId) {
            return this.releaseWeeks()[Math.floor(i / Math.max(1, this.schedule.perWeek || 1))];
        }
    }
    return null;
};

learningPath.isReleased = function (equipId, now) {
    var date = this.releaseDate(equipId);
    return !date || (now || new Date()) >= date;
};

// Current release week, 1-based (0 = not started yet), and the total.
learningPath.currentWeek = function (now) {
    if (!this.hasSchedule()) return null;
    now = now || new Date();
    var weeks = this.releaseWeeks();
    var n = 0;
    weeks.forEach(function (w) { if (now >= w) n++; });
    return { week: n, total: weeks.length };
};

