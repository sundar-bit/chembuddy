// ChemBuddy - 2-Week Pilot Learning Path
// Structured daily curriculum covering Pumps (Week 1) and Heat Exchangers (Week 2)

const learningPath = {
    weeks: [
        {
            id: 1,
            title: "Pumps",
            categoryId: "pumps",
            description: "Master the fundamentals of centrifugal, positive displacement, and specialty pumps used in chemical process industries.",
            days: [
                {
                    day: 1,
                    title: "Centrifugal Pumps",
                    description: "Understand the most widely used pump type in chemical plants — centrifugal pumps, their multistage variants, and vertical configurations.",
                    equipmentIds: ["centrifugal-pump", "multistage-pump", "vertical-pump"],
                    quizId: "W1D1"
                },
                {
                    day: 2,
                    title: "Positive Displacement Pumps",
                    description: "Learn about rotary positive displacement pumps including gear and screw types, their operating principles, and ideal applications.",
                    equipmentIds: ["gear-pump", "screw-pump"],
                    quizId: "W1D2"
                },
                {
                    day: 3,
                    title: "Reciprocating & Diaphragm",
                    description: "Explore reciprocating pumps, diaphragm pumps for chemical metering, and peristaltic pumps for sensitive or abrasive fluids.",
                    equipmentIds: ["reciprocating-pump", "diaphragm-pump", "peristaltic-pump"],
                    quizId: "W1D3"
                },
                {
                    day: 4,
                    title: "Specialty Pumps",
                    description: "Study axial flow pumps for high-flow low-head service, turbine pumps for deep wells, and regenerative pumps for low-flow high-head applications.",
                    equipmentIds: ["axial-pump", "turbine-pump", "regenerative-pump"],
                    quizId: "W1D4"
                },
                {
                    day: 5,
                    title: "Pump Selection & Sealless",
                    description: "Learn about canned motor pumps and sealless designs for hazardous or zero-leakage services, and review pump selection criteria.",
                    equipmentIds: ["canned-pump"],
                    quizId: "W1D5"
                }
            ]
        },
        {
            id: 2,
            title: "Heat Exchangers",
            categoryId: "heat-exchangers",
            description: "Explore the design, operation, and troubleshooting of heat exchangers critical to energy recovery and temperature control in process plants.",
            days: [
                {
                    day: 1,
                    title: "Shell & Tube HX",
                    description: "Cover the workhorse of industrial heat exchange — shell and tube exchangers, U-tube designs, and floating head configurations.",
                    equipmentIds: ["shell-tube", "u-tube", "floating-head"],
                    quizId: "W2D1"
                },
                {
                    day: 2,
                    title: "Plate & Spiral HX",
                    description: "Study compact heat exchanger designs including gasketed plate exchangers and spiral heat exchangers for fouling and viscous services.",
                    equipmentIds: ["plate-hx", "spiral-hx"],
                    quizId: "W2D2"
                },
                {
                    day: 3,
                    title: "Air-Cooled & Double Pipe",
                    description: "Learn about air-cooled exchangers for water-scarce locations and double pipe exchangers for small-duty or high-pressure applications.",
                    equipmentIds: ["air-cooled", "double-pipe"],
                    quizId: "W2D3"
                },
                {
                    day: 4,
                    title: "Specialty HX",
                    description: "Explore scraped surface exchangers for viscous and crystallizing fluids, and plate-fin exchangers for cryogenic and aerospace applications.",
                    equipmentIds: ["scraped-surface", "plate-fin"],
                    quizId: "W2D4"
                },
                {
                    day: 5,
                    title: "Corrosion-Resistant HX",
                    description: "Study graphite heat exchangers designed for highly corrosive chemical services, and review heat exchanger selection principles.",
                    equipmentIds: ["graphite-hx"],
                    quizId: "W2D5"
                }
            ]
        }
    ]
};
