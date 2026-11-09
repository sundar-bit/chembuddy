// ChemBuddy - Learning Path (Somaiya University, Chemical Engineering)
//
// Level 1 — Basic Equipment: 11 modules, 25 equipment found in most chemical
// plants and refineries, 2–3 equipment per module (one module a week). Everything else in
// equipmentDB is Level 2 (shown in Browse, not part of the path yet).
//
// Weekly release (see `schedule` below): one module (category) opens each
// Friday at 10 am IST, in path order, and stays open — a student who misses a
// week can catch up. A module's lessons are done in order: the next lesson
// opens once the previous one is studied and its quiz taken. A module only
// opens for a student who has finished every earlier module.
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
    //   startDate:  the first opening day (a Friday), 'YYYY-MM-DD';
    //               null = self-paced (no schedule)
    //   openTime:   time each module opens, 'HH:MM', 24-hour, IST
    //   pauseWeeks: opening days when nothing new opens (exams, holidays),
    //               e.g. ['2026-12-26'] pushes that module and all later ones
    //               back a week
    //   previewEmails: demo/test accounts that see every finished lesson,
    //               ignoring dates and order (lower case)
    schedule: {
        startDate: '2026-11-13',
        openTime: '10:00',
        pauseWeeks: [],
        previewEmails: [
            'chembuddy.test.sundar@example.com',
            'chembuddy.test.richa@example.com'
        ]
    },

    modules: [
        {
            id: 1,
            title: 'Valves',
            categoryId: 'piping',
            description: 'Isolating and throttling flow.',
            equipment: [
                { id: 'gate-valve', name: 'Gate Valves' },
                { id: 'globe-valve', name: 'Globe Valves' },
                { id: 'butterfly-valve', name: 'Butterfly Valves' }
            ]
        },
        {
            id: 2,
            title: 'Pumps',
            categoryId: 'pumps',
            description: 'Moving liquids — the centrifugal workhorse and the positive-displacement reciprocating pump.',
            equipment: [
                { id: 'centrifugal-pump', name: 'Centrifugal Pumps' },
                { id: 'reciprocating-pump', name: 'Reciprocating Pumps' }
            ]
        },
        {
            id: 3,
            title: 'Compressors',
            categoryId: 'compressors',
            description: 'Raising gas pressure — dynamic and positive-displacement compression.',
            equipment: [
                { id: 'centrifugal-compressor', name: 'Centrifugal Compressors' },
                { id: 'reciprocating-compressor', name: 'Reciprocating Compressors' }
            ]
        },
        {
            id: 4,
            title: 'Heat Exchangers',
            categoryId: 'heat-exchangers',
            description: 'Transferring heat between process streams, water and air.',
            equipment: [
                { id: 'shell-tube', name: 'Shell and Tube Heat Exchangers' },
                { id: 'air-cooled', name: 'Air Cooled Heat Exchangers' }
            ]
        },
        {
            id: 5,
            title: 'Fired Heaters',
            categoryId: 'fired-heaters',
            description: 'Burning fuel to heat process fluids.',
            equipment: [
                { id: 'cabin-heater', name: 'Cabin/Box Heaters' },
                { id: 'cylindrical-heater', name: 'Cylindrical Heaters' }
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
            title: 'Columns',
            categoryId: 'columns',
            description: 'Separating mixtures by vapour–liquid contact on trays and packing.',
            equipment: [
                { id: 'tray-column', name: 'Tray Columns' },
                { id: 'packed-column', name: 'Packed Columns' }
            ]
        },
        {
            id: 8,
            title: 'Separators',
            categoryId: 'solid-liquid',
            description: 'Removing solids from gases and liquids.',
            equipment: [
                { id: 'filter-press', name: 'Filter Presses' },
                { id: 'cyclone-separator', name: 'Cyclone Separators' },
                { id: 'centrifuge-decanter', name: 'Decanter Centrifuges' }
            ]
        },
        {
            id: 9,
            title: 'Atmospheric Tanks',
            categoryId: 'storage',
            description: 'Holding liquids at atmospheric pressure — cone roof and floating roof.',
            equipment: [
                { id: 'atmospheric-tank', name: 'Cone Roof Tanks' },
                { id: 'floating-roof-tank', name: 'Floating Roof Tanks' }
            ]
        },
        {
            id: 10,
            title: 'Pressurised Storage',
            categoryId: 'storage',
            description: 'Holding liquefied gases under pressure — bullets and spheres.',
            equipment: [
                { id: 'bullet-storage', name: 'Bullets' },
                { id: 'sphere-storage', name: 'Spheres' }
            ]
        },
        {
            id: 11,
            title: 'Safety Equipment',
            categoryId: 'safety',
            description: 'Protecting people and plant from overpressure and runaway events.',
            equipment: [
                { id: 'relief-valve', name: 'Pressure Relief Valves' },
                { id: 'rupture-disc', name: 'Rupture Discs' }
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

// Release times are Indian Standard Time (UTC+5:30, no daylight
// saving), whatever time zone the student's device is set to.
var IST_OFFSET_MS = 330 * 60 * 1000;

function istMidnight(ymd) {
    var p = ymd.split('-');
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]) - IST_OFFSET_MS);
}

function istDateStrOf(d) {
    return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

learningPath.hasSchedule = function () {
    return !!(this.schedule && this.schedule.startDate);
};

// Demo/test accounts that skip the dates and the order.
learningPath.isPreview = function (email) {
    var list = (this.schedule && this.schedule.previewEmails) || [];
    return !!email && list.indexOf(String(email).toLowerCase()) !== -1;
};

// Opening day of each module, skipping pause weeks: [Date, Date, …]
learningPath.releaseWeeks = function () {
    var s = this.schedule;
    var needed = this.modules.length;
    var pauses = s.pauseWeeks || [];
    var weeks = [];
    var hm = (s.openTime || '00:00').split(':');
    var t = istMidnight(s.startDate).getTime() + (+hm[0] * 60 + +hm[1]) * 60 * 1000;
    while (weeks.length < needed) {
        var d = new Date(t);
        if (pauses.indexOf(istDateStrOf(d)) === -1) weeks.push(d);
        t += 7 * 24 * 60 * 60 * 1000;
    }
    return weeks;
};

// The moment an equipment's module opens (openTime IST), or null when there is
// no schedule.
learningPath.releaseDate = function (equipId) {
    if (!this.hasSchedule()) return null;
    var found = this.findEquipment(equipId);
    if (!found) return null;
    return this.releaseWeeks()[this.modules.indexOf(found.module)];
};

// The opening time for messages: '10 am', '2:30 pm'; '' for midnight or unset.
learningPath.openTimeLabel = function () {
    var v = this.schedule && this.schedule.openTime;
    if (!v || v === '00:00') return '';
    var p = v.split(':'), h = +p[0], m = +p[1];
    return (h % 12 || 12) + (m ? ':' + (m < 10 ? '0' : '') + m : '') + (h < 12 ? ' am' : ' pm');
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

