import { today } from "./index";
import { julianDayNumber } from "./sun";
import { DateTime } from "luxon";

function proper_angle(value: number): number {
    if (value > 0.0) {
        value /= 360.0;
        return (value - Math.floor(value)) * 360.0;
    } else {
        let tmp = Math.ceil(Math.abs(value / 360.0));
        return value + tmp * 360.0;
    }
}

function _phase_asfloat(date: DateTime): number {
    let jd = julianDayNumber(date);
    let DT = Math.pow(jd - 2382148, 2) / (41048480 * 86400);
    let T = (jd + DT - 2451545.0) / 36525;
    let T2 = Math.pow(T, 2);
    let T3 = Math.pow(T, 3);
    let D = 297.85 + 445267.1115 * T - 0.00163 * T2 + T3 / 545868;
    D = _toRadians(proper_angle(D));
    let M = 357.53 + 35999.0503 * T;
    M = _toRadians(proper_angle(M));
    let M1 = 134.96 + 477198.8676 * T + 0.008997 * T2 + T3 / 69699;
    M1 = _toRadians(proper_angle(M1));
    let elong = _toDegrees(D) + 6.29 * Math.sin(M1);
    elong -= 2.1 * Math.sin(M);
    elong += 1.27 * Math.sin(2 * D - M1);
    elong += 0.66 * Math.sin(2 * D);
    elong = proper_angle(elong);
    elong = Math.round(elong);
    let moon = ((elong + 6.43) / 360) * 28;
    return moon;
}

/**
 * Calculates the phase of the moon on the specified date.
 *
 *          ============  ==============
 *          0 .. 6.99     New moon
 *          7 .. 13.99    First quarter
 *          14 .. 20.99   Full moon
 *          21 .. 27.99   Last quarter
 *          ============  ==============
 *
 * @param date The date to calculate the phase for. Dates are always in the UTC timezone.
 *             If not specified then today's date is used.
 * @returns A number designating the phase.
 */
function phase(date?: DateTime): number {
    if (!date) {
        date = today();
    }

    let moon = _phase_asfloat(date);
    if (moon >= 28.0) {
        moon -= 28.0;
    }
    return moon;
}

function _toRadians(degrees: number): number {
    return degrees * (Math.PI / 180.0);
}

function _toDegrees(radians: number): number {
    return radians * (180.0 / Math.PI);
}

export { phase };
