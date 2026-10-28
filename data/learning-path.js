// ChemBuddy - Learning Path (Somaiya University, Chemical Engineering)
//
// Level 1 — Basic Equipment: 12 modules of equipment found in most chemical
// plants and refineries, 2–3 equipment per module. Everything else in
// equipmentDB is Level 2 (shown in Browse, not part of the path yet).
//
// Self-paced: every module is open from the start. Inside a module, the next
// equipment unlocks once the previous one has been studied.
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
            title: 'Fired Heaters & Boilers',
            categoryId: 'fired-heaters',
            description: 'Burning fuel to heat process fluids and raise steam.',
            equipment: [
                { id: 'cabin-heater', name: 'Cabin/Box Heaters' },
                { id: 'cylindrical-heater', name: 'Cylindrical Heaters' },
                { id: 'boiler', name: 'Steam Boilers' }
            ]
        },
        {
            id: 9,
            title: 'Utilities',
            categoryId: 'utilities',
            description: 'The services every plant runs on — cooling water and compressed air.',
            equipment: [
                { id: 'cooling-tower', name: 'Cooling Towers' },
                { id: 'air-compressor', name: 'Compressed Air Systems' },
                { id: 'instrument-air', name: 'Instrument Air Systems' }
            ]
        },
        {
            id: 10,
            title: 'Instrumentation',
            categoryId: 'instrumentation',
            description: 'Measuring flow, pressure and level — the eyes of the control room.',
            equipment: [
                { id: 'flow-meter', name: 'Flow Meters' },
                { id: 'pressure-transmitter', name: 'Pressure Transmitters' },
                { id: 'level-instrument', name: 'Level Instruments' }
            ]
        },
        {
            id: 11,
            title: 'Safety',
            categoryId: 'safety',
            description: 'Protecting people and plant from overpressure and runaway events.',
            equipment: [
                { id: 'relief-valve', name: 'Pressure Relief Valves' },
                { id: 'rupture-disc', name: 'Rupture Discs' },
                { id: 'emergency-shutdown', name: 'Emergency Shutdown Systems' }
            ]
        },
        {
            id: 12,
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
