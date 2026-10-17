// ChemBuddy - Equipment Categories
//
// Display details (icon, short description) for the 19 categories in
// equipmentDB. `name` must match the `category` field of the equipment.
//
// The equipment under each category is NOT listed here: the Browse menu is
// built from equipmentDB itself (see Equipment.getBrowseSections), so every
// equipment with content appears in Browse and nothing appears without content.
// Order here is the order of the Level 2 groups in Browse.
const categories = [
    {id:'pumps', name:'Pumps', icon:'\u{1F504}', desc:'Centrifugal, PD'},
    {id:'compressors', name:'Compressors & Blowers', icon:'\u{1F4A8}', desc:'Gas Compression'},
    {id:'heat-exchangers', name:'Heat Exchangers', icon:'\u{1F525}', desc:'Shell & Tube, Plate'},
    {id:'fired-heaters', name:'Fired Heaters', icon:'\u{1F536}', desc:'Process Furnaces'},
    {id:'evaporators', name:'Evaporators', icon:'\u{1F4A7}', desc:'Concentration'},
    {id:'dryers', name:'Dryers', icon:'\u{2600}\u{FE0F}', desc:'Drying Equipment'},
    {id:'reactors', name:'Reactors', icon:'\u{2697}\u{FE0F}', desc:'Chemical Reactors'},
    {id:'columns', name:'Columns', icon:'\u{1F5FC}', desc:'Distillation, Absorption'},
    {id:'mixing', name:'Mixing Equipment', icon:'\u{1F32A}\u{FE0F}', desc:'Agitators, Mixers'},
    {id:'solid-liquid', name:'Solid-Liquid Separation', icon:'\u{1F52C}', desc:'Filters, Centrifuges'},
    {id:'gas-solid', name:'Gas-Solid Separation', icon:'\u{1F32B}\u{FE0F}', desc:'Cyclones, ESPs'},
    {id:'crystallizers', name:'Crystallizers', icon:'\u{1F48E}', desc:'Crystallization'},
    {id:'conveyors', name:'Material Handling', icon:'\u{27A1}\u{FE0F}', desc:'Conveyors, Feeders'},
    {id:'storage', name:'Storage Tanks', icon:'\u{1F6E2}\u{FE0F}', desc:'Tanks, Vessels'},
    {id:'piping', name:'Piping & Valves', icon:'\u{1F517}', desc:'Piping Systems'},
    {id:'utilities', name:'Utilities', icon:'\u{2699}\u{FE0F}', desc:'Steam, Water, Air'},
    {id:'instrumentation', name:'Instrumentation', icon:'\u{1F4CA}', desc:'Sensors, Meters'},
    {id:'safety', name:'Safety Equipment', icon:'\u{1F9BA}', desc:'PPE, Emergency'},
    {id:'size-reduction', name:'Size Reduction', icon:'\u{2692}\u{FE0F}', desc:'Crushers, Mills'}
];
