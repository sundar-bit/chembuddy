// ChemBuddy - Speech wording
//
// The screen shows engineering shorthand (m3/h, °C, 10-100 bar, ±2%); the
// narration should say it the way a person reads it aloud ("cubic metres per
// hour", "degrees Celsius", "10 to 100 bar", "plus or minus 2 percent").
// speechText() rewrites one piece of text for the voice only.

var SpeechText = (function () {
    'use strict';

    // Units that follow a number. Longest / most specific first.
    var UNITS = [
        ['m³/hr', 'cubic metres per hour'], ['m3/hr', 'cubic metres per hour'],
        ['m³/h', 'cubic metres per hour'], ['m3/h', 'cubic metres per hour'],
        ['kW/m³', 'kilowatts per cubic metre'], ['kW/m3', 'kilowatts per cubic metre'],
        ['L/m³', 'litres per cubic metre'], ['L/m3', 'litres per cubic metre'],
        ['kg/m²', 'kilograms per square metre'], ['kg/m2', 'kilograms per square metre'],
        ['%/day', 'percent per day'],
        ['t/day', 'tonnes per day'], ['t/hr', 'tonnes per hour'], ['t/h', 'tonnes per hour'],
        ['kg/hr', 'kilograms per hour'], ['kg/h', 'kilograms per hour'],
        ['L/min', 'litres per minute'], ['L/hr', 'litres per hour'], ['L/h', 'litres per hour'],
        ['m/min', 'metres per minute'], ['m/hr', 'metres per hour'], ['m/s', 'metres per second'],
        ['ft/min', 'feet per minute'],
        ['m³', 'cubic metres'], ['m3', 'cubic metres'], ['m²', 'square metres'], ['m2', 'square metres'],
        ['°C', 'degrees Celsius'], ['ºC', 'degrees Celsius'], ['deg C', 'degrees Celsius'],
        ['°F', 'degrees Fahrenheit'], ['°', 'degrees'],
        ['mbar', 'millibar'], ['barg', 'bar gauge'], ['bara', 'bar absolute'], ['bar', 'bar'],
        ['kPa', 'kilopascals'], ['MPa', 'megapascals'], ['Pa', 'pascals'],
        ['psig', 'pounds per square inch gauge'], ['psi', 'pounds per square inch'],
        ['RPM', 'revolutions per minute'], ['rpm', 'revolutions per minute'],
        ['MVA', 'mega volt amperes'], ['MHz', 'megahertz'],
        ['MW', 'megawatts'], ['kW', 'kilowatts'], ['HP', 'horsepower'], ['hp', 'horsepower'],
        ['kV', 'kilovolts'], ['mV', 'millivolts'], ['mA', 'milliamps'],
        ['cP', 'centipoise'], ['μm', 'microns'], ['µm', 'microns'],
        ['mm', 'millimetres'], ['cm', 'centimetres'], ['km', 'kilometres'], ['m', 'metres'],
        ['mL', 'millilitres'], ['L', 'litres'],
        ['kg', 'kilograms'], ['lb', 'pounds'],   // no bare 'g': in this content it is usually g-force
        ['hrs', 'hours'], ['hr', 'hours'], ['min', 'minutes'],
        ['G', 'times gravity'],    // "2000 G" (g-force)
        ['C', 'degrees Celsius']   // "500C"
    ];

    function escape(s) {
        return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    }

    // number (with optional trailing +) then unit, not followed by a letter/digit
    var unitRegex = new RegExp(
        '(\\d(?:[\\d,]*\\d)?(?:\\.\\d+)?\\+?)\\s?(' + UNITS.map(function (u) { return escape(u[0]); }).join('|') + ')(?![A-Za-z0-9²³])',
        'g');
    var unitWords = {};
    UNITS.forEach(function (u) { unitWords[u[0]] = u[1]; });

    var WORDS = [
        [/\be\.g\.,?/gi, 'for example'],
        [/\bi\.e\.,?/gi, 'that is'],
        [/\betc\./gi, 'et cetera'],
        [/\bapprox\.?(?=\s)/gi, 'approximately'],
        [/\bvs\.?(?=\s)/gi, 'versus'],
        [/\bmax\.?(?=\s|$)/gi, 'maximum'],
        [/\bmin\.(?=\s|$)/gi, 'minimum'],
        [/\bplus\/minus\b/gi, 'plus or minus'],
        [/\blockout\s?\/\s?tagout\b/gi, 'lockout tagout'],
        [/\bdegrees C\b/g, 'degrees Celsius'],
        [/\bdegrees F\b/g, 'degrees Fahrenheit'],
        [/\bBEP\b/g, 'best efficiency point'],
        [/\bNPSHr\b/g, 'N P S H required'],
        [/\bNPSHa\b/g, 'N P S H available']
    ];

    function speechText(text) {
        var t = String(text);

        WORDS.forEach(function (w) { t = t.replace(w[0], w[1]); });

        t = t.replace(/±\s?/g, 'plus or minus ')
            .replace(/≥\s?/g, 'at least ')
            .replace(/≤\s?/g, 'at most ')
            .replace(/>\s?(?=\d)/g, 'more than ')
            .replace(/<\s?(?=\d)/g, 'less than ')
            .replace(/~\s?(?=\d)/g, 'about ');

        // A minus sign at the start of a number: "-50 to 400" → "minus 50 to 400"
        t = t.replace(/(^|[\s(:])[-−–](?=\d)/g, '$1minus ');
        // Ranges: "10-100", "4 – 20" → "10 to 100" — but not standard numbers like "ISO 8573-1"
        t = t.replace(/(?<!(?:ISO|API|IEC|EN|NFPA|ANSI|ASME|BS|IS|DIN|TEMA|Z)\s?\d*)(\d)\s?[-–]\s?(?=\d)/g, '$1 to ');
        // Ratios: "25:1" → "25 to 1"
        t = t.replace(/(\d)\s?:\s?(?=\d)/g, '$1 to ');
        // "2-10x" → "2 to 10 times"
        t = t.replace(/(\d)\s?x(?![A-Za-z0-9])/g, '$1 times');

        // Units after numbers, also after the second number of a range
        t = t.replace(unitRegex, function (all, num, unit) {
            var plus = /\+$/.test(num);
            return num.replace(/\+$/, '') + (plus ? ' plus ' : ' ') + unitWords[unit];
        });

        // "open/close", "on/off" → "open or close" (units are already spelt out)
        t = t.replace(/([A-Za-z]{2,})\/(?=[A-Za-z]{2,})/g, '$1 or ');

        t = t.replace(/(\d)\s?%/g, '$1 percent')
            .replace(/(\d)\+(?=\s|$|[,;.)])/g, '$1 plus');

        return t.replace(/\s{2,}/g, ' ').trim();
    }

    return { speechText: speechText };
})();

if (typeof module !== 'undefined') module.exports = SpeechText;
