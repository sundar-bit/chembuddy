// ChemBuddy - Equipment Categories
// 19 categories, 219 equipment items total
const categories = [
    {id:'pumps', name:'Pumps', icon:'\u{1F504}', desc:'Centrifugal, PD', items:[
        {id:'centrifugal-pump',name:'Centrifugal Pumps'},{id:'multistage-pump',name:'Multistage Pumps'},{id:'vertical-pump',name:'Vertical Pumps'},
        {id:'axial-pump',name:'Axial Flow Pumps'},{id:'turbine-pump',name:'Turbine Pumps'},{id:'regenerative-pump',name:'Regenerative Pumps'},
        {id:'reciprocating-pump',name:'Reciprocating Pumps'},{id:'diaphragm-pump',name:'Diaphragm Pumps'},{id:'gear-pump',name:'Gear Pumps'},
        {id:'screw-pump',name:'Screw Pumps'},{id:'peristaltic-pump',name:'Peristaltic Pumps'},{id:'canned-pump',name:'Canned Motor Pumps'}
    ]},
    {id:'compressors', name:'Compressors & Blowers', icon:'\u{1F4A8}', desc:'Gas Compression', items:[
        {id:'centrifugal-compressor',name:'Centrifugal Compressors'},{id:'axial-compressor',name:'Axial Compressors'},
        {id:'reciprocating-compressor',name:'Reciprocating Compressors'},{id:'screw-compressor',name:'Screw Compressors'},
        {id:'rotary-vane',name:'Rotary Vane'},{id:'roots-blower',name:'Roots Blowers'},
        {id:'centrifugal-fan',name:'Centrifugal Fans'},{id:'axial-fan',name:'Axial Fans'},
        {id:'ejector',name:'Ejectors'},{id:'vacuum-pump',name:'Vacuum Pumps'}
    ]},
    {id:'heat-exchangers', name:'Heat Exchangers', icon:'\u{1F525}', desc:'Shell & Tube, Plate', items:[
        {id:'shell-tube',name:'Shell & Tube'},{id:'u-tube',name:'U-Tube'},{id:'floating-head',name:'Floating Head'},
        {id:'plate-hx',name:'Plate Exchangers'},{id:'air-cooled',name:'Air Cooled'},{id:'double-pipe',name:'Double Pipe'},
        {id:'spiral-hx',name:'Spiral'},{id:'scraped-surface',name:'Scraped Surface'},{id:'plate-fin',name:'Plate-Fin'},{id:'graphite-hx',name:'Graphite'}
    ]},
    {id:'fired-heaters', name:'Fired Heaters', icon:'\u{1F536}', desc:'Process Furnaces', items:[
        {id:'cabin-heater',name:'Cabin/Box Heaters'},{id:'cylindrical-heater',name:'Cylindrical Heaters'},
        {id:'reformer',name:'Reformer Furnaces'},{id:'pyrolysis',name:'Pyrolysis Furnaces'},
        {id:'vertical-tube',name:'Vertical Tube'},{id:'radiant-wall',name:'Radiant Wall'}
    ]},
    {id:'evaporators', name:'Evaporators', icon:'\u{1F4A7}', desc:'Concentration', items:[
        {id:'forced-circ-evap',name:'Forced Circulation'},{id:'rising-film',name:'Rising Film'},{id:'falling-film',name:'Falling Film'},
        {id:'calandria',name:'Calandria'},{id:'horizontal-tube-evap',name:'Horizontal Tube'},{id:'agitated-film',name:'Agitated Thin Film'},
        {id:'multiple-effect',name:'Multiple Effect'},{id:'mvr',name:'MVR'},{id:'flash-evap',name:'Flash'},{id:'submerged-comb',name:'Submerged Combustion'}
    ]},
    {id:'dryers', name:'Dryers', icon:'\u{2600}\u{FE0F}', desc:'Drying Equipment', items:[
        {id:'rotary-dryer',name:'Rotary Dryers'},{id:'spray-dryer',name:'Spray Dryers'},{id:'fluid-bed-dryer',name:'Fluidized Bed'},
        {id:'tray-dryer',name:'Tray Dryers'},{id:'tunnel-dryer',name:'Tunnel Dryers'},{id:'vacuum-dryer',name:'Vacuum Dryers'},
        {id:'drum-dryer',name:'Drum Dryers'},{id:'flash-dryer',name:'Flash Dryers'},{id:'conveyor-dryer',name:'Conveyor Dryers'},
        {id:'conical-dryer',name:'Conical Mixer'},{id:'paddle-dryer',name:'Paddle Dryers'},{id:'freeze-dryer',name:'Freeze Dryers'},
        {id:'infrared-dryer',name:'Infrared'},{id:'microwave-dryer',name:'Microwave'},{id:'spin-flash',name:'Spin Flash'}
    ]},
    {id:'reactors', name:'Reactors', icon:'\u{2697}\u{FE0F}', desc:'Chemical Reactors', items:[
        {id:'batch-reactor',name:'Batch Reactors'},{id:'cstr',name:'CSTR'},{id:'pfr',name:'Plug Flow'},
        {id:'fixed-bed',name:'Fixed Bed'},{id:'fluidized-bed-rx',name:'Fluidized Bed'},{id:'trickle-bed',name:'Trickle Bed'},
        {id:'slurry-reactor',name:'Slurry Reactors'},{id:'bubble-column-rx',name:'Bubble Column'},{id:'loop-reactor',name:'Loop Reactors'},{id:'autoclave',name:'Autoclave'}
    ]},
    {id:'columns', name:'Columns', icon:'\u{1F5FC}', desc:'Distillation, Absorption', items:[
        {id:'distillation',name:'Distillation Columns'},{id:'packed-column',name:'Packed Columns'},{id:'absorption',name:'Absorption Columns'},
        {id:'stripping',name:'Stripping Columns'},{id:'extraction-col',name:'Extraction Columns'},{id:'wetted-wall',name:'Wetted Wall'},
        {id:'spray-column',name:'Spray Columns'},{id:'bubble-column',name:'Bubble Columns'}
    ]},
    {id:'mixing', name:'Mixing Equipment', icon:'\u{1F32A}\u{FE0F}', desc:'Agitators, Mixers', items:[
        {id:'turbine-agitator',name:'Turbine Agitators'},{id:'propeller-agitator',name:'Propeller Agitators'},{id:'paddle-agitator',name:'Paddle/Anchor'},
        {id:'helical-ribbon',name:'Helical Ribbon'},{id:'static-mixer',name:'Static Mixers'},{id:'homogenizer',name:'Homogenizers'},
        {id:'ribbon-blender',name:'Ribbon Blenders'},{id:'v-blender',name:'V-Blenders'},{id:'jet-mixer',name:'Jet Mixers'},{id:'high-shear',name:'High Shear Mixers'}
    ]},
    {id:'solid-liquid', name:'Solid-Liquid Separation', icon:'\u{1F52C}', desc:'Filters, Centrifuges', items:[
        {id:'thickener',name:'Thickeners'},{id:'lamella',name:'Lamella Settlers'},{id:'clarifier',name:'Clarifiers'},
        {id:'disc-centrifuge',name:'Disc Centrifuges'},{id:'decanter',name:'Decanters'},{id:'basket-centrifuge',name:'Basket Centrifuges'},
        {id:'hydrocyclone',name:'Hydrocyclones'},{id:'plate-frame',name:'Plate & Frame'},{id:'rotary-vacuum',name:'Rotary Vacuum'},
        {id:'belt-filter',name:'Belt Filters'},{id:'pressure-leaf',name:'Pressure Leaf'},{id:'cartridge-filter',name:'Cartridge Filters'},
        {id:'bag-filter-liq',name:'Bag Filters'},{id:'membrane-filter',name:'Membrane Filters'},{id:'precoat-filter',name:'Precoat Filters'}
    ]},
    {id:'gas-solid', name:'Gas-Solid Separation', icon:'\u{1F32B}\u{FE0F}', desc:'Cyclones, ESPs', items:[
        {id:'cyclone',name:'Cyclone Separators'},{id:'multicyclone',name:'Multicyclones'},{id:'baghouse',name:'Baghouses'},
        {id:'esp',name:'Electrostatic Precipitators'},{id:'wet-scrubber',name:'Wet Scrubbers'},{id:'venturi-scrubber',name:'Venturi Scrubbers'},
        {id:'impingement',name:'Impingement Separators'},{id:'hepa',name:'HEPA Filters'}
    ]},
    {id:'crystallizers', name:'Crystallizers', icon:'\u{1F48E}', desc:'Crystallization', items:[
        {id:'fc-crystallizer',name:'Forced Circulation'},{id:'dtb',name:'DTB Crystallizers'},{id:'oslo',name:'Oslo Crystallizers'},
        {id:'vacuum-cryst',name:'Vacuum Crystallizers'},{id:'cooling-cryst',name:'Cooling Crystallizers'},
        {id:'evap-cryst',name:'Evaporative'},{id:'melt-cryst',name:'Melt Crystallizers'}
    ]},
    {id:'conveyors', name:'Material Handling', icon:'\u{27A1}\u{FE0F}', desc:'Conveyors, Feeders', items:[
        {id:'belt-conveyor',name:'Belt Conveyors'},{id:'screw-conveyor',name:'Screw Conveyors'},{id:'pneumatic',name:'Pneumatic Conveyors'},
        {id:'bucket-elevator',name:'Bucket Elevators'},{id:'vibrating-conv',name:'Vibrating Conveyors'},{id:'chain-conveyor',name:'Chain Conveyors'},
        {id:'apron-conveyor',name:'Apron Conveyors'},{id:'rotary-feeder',name:'Rotary Feeders'},{id:'bin-activator',name:'Bin Activators'},{id:'weigh-feeder',name:'Weigh Feeders'}
    ]},
    {id:'storage', name:'Storage Tanks', icon:'\u{1F6E2}\u{FE0F}', desc:'Tanks, Vessels', items:[
        {id:'fixed-roof',name:'Fixed Roof Tanks'},{id:'floating-roof',name:'Floating Roof'},{id:'sphere',name:'Spherical Tanks'},
        {id:'bullet-tank',name:'Bullet Tanks'},{id:'pressure-vessel',name:'Pressure Vessels'},{id:'ust',name:'Underground Tanks'},
        {id:'cryogenic',name:'Cryogenic Tanks'},{id:'day-tank',name:'Day Tanks'},{id:'silo',name:'Silos'},{id:'gas-holder',name:'Gas Holders'}
    ]},
    {id:'piping', name:'Piping & Valves', icon:'\u{1F517}', desc:'Piping Systems', items:[
        {id:'process-pipe',name:'Process Piping'},{id:'utility-pipe',name:'Utility Piping'},{id:'gate-valve',name:'Gate Valves'},
        {id:'globe-valve',name:'Globe Valves'},{id:'ball-valve',name:'Ball Valves'},{id:'butterfly-valve',name:'Butterfly Valves'},
        {id:'control-valve',name:'Control Valves'},{id:'check-valve',name:'Check Valves'},{id:'relief-valve',name:'Relief Valves'},
        {id:'plug-valve',name:'Plug Valves'},{id:'needle-valve',name:'Needle Valves'},{id:'diaphragm-valve',name:'Diaphragm Valves'},
        {id:'pinch-valve',name:'Pinch Valves'},{id:'elbow',name:'Elbows'},{id:'tee',name:'Tees & Crosses'},
        {id:'reducer',name:'Reducers'},{id:'union',name:'Unions'},{id:'flange',name:'Flanges'},
        {id:'gasket',name:'Gaskets'},{id:'expansion-joint',name:'Expansion Joints'},{id:'strainer',name:'Strainers'},
        {id:'steam-trap',name:'Steam Traps'},{id:'flex-hose',name:'Flexible Hoses'},{id:'spectacle-blind',name:'Spectacle Blinds'},{id:'rupture-disc',name:'Rupture Discs'}
    ]},
    {id:'utilities', name:'Utilities', icon:'\u{2699}\u{FE0F}', desc:'Steam, Water, Air', items:[
        {id:'boiler',name:'Boilers'},{id:'cooling-tower',name:'Cooling Towers'},{id:'chiller',name:'Chillers'},
        {id:'air-compressor',name:'Air Compressors'},{id:'nitrogen-gen',name:'Nitrogen Systems'},{id:'water-treatment',name:'Water Treatment'},
        {id:'dm-plant',name:'Demineralizers'},{id:'deaerator',name:'Deaerators'},{id:'ww-treatment',name:'Wastewater Treatment'},
        {id:'incinerator',name:'Incinerators'},{id:'flare',name:'Flare Systems'},{id:'condensate',name:'Condensate Systems'}
    ]},
    {id:'instrumentation', name:'Instrumentation', icon:'\u{1F4CA}', desc:'Sensors, Meters', items:[
        {id:'flow-meter',name:'Flow Meters'},{id:'pressure-inst',name:'Pressure Instruments'},{id:'temp-sensor',name:'Temperature Sensors'},
        {id:'level-inst',name:'Level Instruments'},{id:'ph-meter',name:'pH Meters'},{id:'analyzer',name:'Process Analyzers'},
        {id:'rotameter',name:'Rotameters'},{id:'density-meter',name:'Density Meters'},{id:'viscometer',name:'Viscometers'},{id:'conductivity',name:'Conductivity Meters'}
    ]},
    {id:'safety', name:'Safety Equipment', icon:'\u{1F9BA}', desc:'PPE, Emergency', items:[
        {id:'ppe',name:'PPE'},{id:'eyewash',name:'Eye Wash Stations'},{id:'safety-shower',name:'Safety Showers'},
        {id:'fire-ext',name:'Fire Extinguishers'},{id:'gas-detector',name:'Gas Detectors'},{id:'spill-contain',name:'Spill Containment'},
        {id:'flame-arrester',name:'Flame Arresters'},{id:'deluge',name:'Deluge Systems'},{id:'emergency-vent',name:'Emergency Vents'},{id:'scba',name:'SCBA'}
    ]},
    {id:'size-reduction', name:'Size Reduction', icon:'\u{2692}\u{FE0F}', desc:'Crushers, Mills', items:[
        {id:'jaw-crusher',name:'Jaw Crushers'},{id:'gyratory-crusher',name:'Gyratory Crushers'},{id:'cone-crusher',name:'Cone Crushers'},
        {id:'roll-crusher',name:'Roll Crushers'},{id:'roll-press',name:'HPGR / Roll Press'},{id:'impact-crusher',name:'Impact Breakers'},
        {id:'hammer-crusher',name:'Hammer Crushers'},{id:'cage-mill',name:'Cage Mills'},{id:'pan-crusher',name:'Pan Crushers'},
        {id:'ball-mill',name:'Ball Mills'},{id:'rod-mill',name:'Rod Mills'},{id:'sag-mill',name:'SAG Mills'},
        {id:'pebble-mill',name:'Pebble Mills'},{id:'stirred-mill',name:'Stirred Media Mills'},{id:'vibratory-mill',name:'Vibratory Mills'},
        {id:'planetary-mill',name:'Planetary Mills'},{id:'hammer-mill',name:'Hammer Mills'},{id:'pin-mill',name:'Pin Mills'},
        {id:'ring-roller-mill',name:'Ring-Roller Mills'},{id:'bowl-mill',name:'Bowl Mills'},{id:'attrition-mill',name:'Attrition Mills'},
        {id:'colloid-mill',name:'Colloid Mills'},{id:'jet-mill',name:'Jet Mills'}
    ]}
];
