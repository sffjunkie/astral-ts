import { DateTime } from 'luxon';
import { Observer, SunDirection, today, now, Depression } from './index';
import { MathError, ValueError } from './error';

// Using 32 arc minutes as sun's apparent diameter
const SUN_APPARENT_RADIUS = 32.0 / (60.0 * 2.0);

/** Calculate the Julian Day for the specified date */
function julianDayNumber(date: DateTime): number {
    let y = date.year;
    let m = date.month;
    let d = date.day;

    if (m <= 2) {
        y -= 1;
        m += 12;
    }

    let a = Math.floor(y / 100.0);
    let b = 2 - a + Math.floor(a / 4.0);
    let jd =
        Math.floor(365.25 * (y + 4716)) +
        Math.floor(30.6001 * (m + 1)) +
        d +
        b -
        1524.5;

    return jd;
}

/**
 * Convert a Julian Day number to a Julian Century
 *
 * @param julianday - The Julian Day number to convert
 */
function julianDayNumberToJulianCentury(julianday: number): number {
    // """Convert a Julian Day number to a Julian Century"""
    return (julianday - 2451545.0) / 36525.0;
}

/**
 * Convert a Julian Century number to a Julian Day
 *
 * @param juliancentury - The Julian Century number to convert
 */
function julianCenturyToJulianDayNumber(juliancentury: number): number {
    // """Convert a Julian Century number to a Julian Day"""
    return juliancentury * 36525.0 + 2451545.0;
}

/**
 * Calculate the geometric mean longitude of the sun */
function geomMeanLongSun(juliancentury: number): number {
    let l0 =
        280.46646 + juliancentury * (36000.76983 + 0.0003032 * juliancentury);
    return ((l0 % 360.0) + 360.0) % 360.0;
}

/**
 * Calculate the geometric mean anomaly of the sun */
function geomMeanAnomalySun(juliancentury: number): number {
    // """calculate the geometric mean anomaly of the sun"""
    return (
        357.52911 + juliancentury * (35999.05029 - 0.0001537 * juliancentury)
    );
}

/**
 * Calculate the eccentricity of Earth's orbit
 */
function eccentricLocationEarthOrbit(juliancentury: number): number {
    return (
        0.016708634 -
        juliancentury * (0.000042037 + 0.0000001267 * juliancentury)
    );
}

/**
 * Calculate the equation of the center of the sun */
function sunEqOfCenter(juliancentury: number): number {
    let m = geomMeanAnomalySun(juliancentury);

    let mrad = _toRadians(m);
    let sinm = Math.sin(mrad);
    let sin2m = Math.sin(mrad + mrad);
    let sin3m = Math.sin(mrad + mrad + mrad);

    let c =
        sinm *
            (1.914602 - juliancentury * (0.004817 + 0.000014 * juliancentury)) +
        sin2m * (0.019993 - 0.000101 * juliancentury) +
        sin3m * 0.000289;

    return c;
}

/**
 * Calculate the sun's true longitude */
function sunTrueLong(juliancentury: number): number {
    let l0 = geomMeanLongSun(juliancentury);
    let c = sunEqOfCenter(juliancentury);

    return l0 + c;
}

/**
 * Calculate the sun's true anomaly */
function sunTrueAnomoly(juliancentury: number): number {
    let m = geomMeanAnomalySun(juliancentury);
    let c = sunEqOfCenter(juliancentury);

    return m + c;
}

function sunRadVector(juliancentury: number): number {
    let v = sunTrueAnomoly(juliancentury);
    let e = eccentricLocationEarthOrbit(juliancentury);

    return (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(_toRadians(v)));
}

/**
 * Calculate the sun's apparent longitude */
function sunApparentLong(juliancentury: number): number {
    let true_long = sunTrueLong(juliancentury);

    let omega = 125.04 - 1934.136 * juliancentury;
    return true_long - 0.00569 - 0.00478 * Math.sin(_toRadians(omega));
}

function meanObliquityOfEcliptic(juliancentury: number): number {
    let seconds =
        21.448 -
        juliancentury *
            (46.815 + juliancentury * (0.00059 - juliancentury * 0.001813));
    return 23.0 + (26.0 + seconds / 60.0) / 60.0;
}

function obliquityCorrection(juliancentury: number): number {
    let e0 = meanObliquityOfEcliptic(juliancentury);

    let omega = 125.04 - 1934.136 * juliancentury;
    return e0 + 0.00256 * Math.cos(_toRadians(omega));
}

/**
 * Calculate the sun's right ascension */
function sunRtAscension(juliancentury: number): number {
    // """calculate the sun's right ascension"""
    let oc = obliquityCorrection(juliancentury);
    let al = sunApparentLong(juliancentury);

    let tananum = Math.cos(_toRadians(oc)) * Math.sin(_toRadians(al));
    let tanadenom = Math.cos(_toRadians(al));

    return _toDegrees(Math.atan2(tananum, tanadenom));
}

/**
 * Calculate the sun's declination */
function sunDeclination(juliancentury: number): number {
    // """calculate the sun's declination"""
    let e = obliquityCorrection(juliancentury);
    let lambd = sunApparentLong(juliancentury);

    let sint = Math.sin(_toRadians(e)) * Math.sin(_toRadians(lambd));
    return _toDegrees(Math.asin(sint));
}

function var_y(juliancentury: number): number {
    let epsilon = obliquityCorrection(juliancentury);
    let y = Math.tan(_toRadians(epsilon) / 2.0);
    return y * y;
}

function eqOfTime(juliancentury: number): number {
    let l0 = geomMeanLongSun(juliancentury);
    let e = eccentricLocationEarthOrbit(juliancentury);
    let m = geomMeanAnomalySun(juliancentury);

    let y = var_y(juliancentury);

    let sin2l0 = Math.sin(2.0 * _toRadians(l0));
    let sinm = Math.sin(_toRadians(m));
    let cos2l0 = Math.cos(2.0 * _toRadians(l0));
    let sin4l0 = Math.sin(4.0 * _toRadians(l0));
    let sin2m = Math.sin(2.0 * _toRadians(m));

    let Etime =
        y * sin2l0 -
        2.0 * e * sinm +
        4.0 * e * y * sinm * cos2l0 -
        0.5 * y * y * sin4l0 -
        1.25 * e * e * sin2m;

    return _toDegrees(Etime) * 4.0;
}

/**
 * Calculate the hour angle of the sun
 * See https://en.wikipedia.org/wiki/Hour_angle#Solar_hour_angle
 *
 * @param latitude - The latitude of the observer
 * @param declination - The declination of the sun
 * @param zenith - The zenith angle of the sun
 * @param direction - The direction of traversal of the sun
 * @throws MathError
 */
function hourAngle(
    latitude: number,
    declination: number,
    zenith: number,
    direction: SunDirection
): number {
    let latitude_rad = _toRadians(latitude);
    let declination_rad = _toRadians(declination);
    let zenith_rad = _toRadians(zenith);

    let h =
        (Math.cos(zenith_rad) -
            Math.sin(latitude_rad) * Math.sin(declination_rad)) /
        (Math.cos(latitude_rad) * Math.cos(declination_rad));

    if (isNaN(h)) {
        throw new MathError('Unable to calculate hour_angle');
    }

    let HA = Math.acos(h);
    if (isNaN(HA)) {
        throw new MathError('Unable to calculate hour_angle');
    } else {
        if (direction == SunDirection.SETTING) {
            HA = -HA;
        }
        return HA;
    }
}

/**
 * Calculate the extra degrees of depression that you can see round the earth
   due to the increase in elevation.
 * @param elevation - Elevation above the earth in metres
 * @returns A number of degrees to add to adjust for the elevation of the observer 
 */
function adjustToHorizon(elevation: number): number {
    if (elevation <= 0) {
        return 0;
    }

    let r = 6356900; // radius of the earth
    let a1 = r;
    let h1 = r + elevation;
    let theta1 = Math.acos(a1 / h1);

    let a2 = r * Math.sin(theta1);
    let b2 = r - r * Math.cos(theta1);
    let h2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));
    let alpha = Math.acos(a2 / h2);

    return _toDegrees(alpha);
}

/**
 * Calculate the extra degrees of depression needed for the sun to be visible
 * over an obscuring feature.
 * @param elevation - A tuple of 2 floating point numbers. The first number is
 *                    the horizontal distance to the feature and the second is
 *                    the vertical distance
 */
function adjustToObscuringFeature(elevation: [number, number]): number {
    if (elevation[0] == 0.0) {
        return 0.0;
    }

    let sign = elevation[0] < 0.0 ? -1 : 1;
    return (
        sign *
        _toDegrees(
            Math.acos(
                Math.abs(elevation[0]) /
                    Math.sqrt(
                        Math.pow(elevation[0], 2) + Math.pow(elevation[1], 2)
                    )
            )
        )
    );
}

/**
 * Calculate the degrees of refraction of the sun due to the sun's elevation.
 * @param zenith - The zenith angle to the sun
 */
function refractionAtZenith(zenith: number): number {
    let elevation = 90 - zenith;
    if (elevation >= 85.0) {
        return 0;
    }

    let refractionCorrection = 0.0;
    let te = Math.tan(_toRadians(elevation));
    if (elevation > 5.0) {
        refractionCorrection =
            58.1 / te -
            0.07 / (te * te * te) +
            0.000086 / (te * te * te * te * te);
    } else if (elevation > -0.575) {
        let step1 = -12.79 + elevation * 0.711;
        let step2 = 103.4 + elevation * step1;
        let step3 = -518.2 + elevation * step2;
        refractionCorrection = 1735.0 + elevation * step3;
    } else {
        refractionCorrection = -20.774 / te;
    }

    refractionCorrection = refractionCorrection / 3600.0;

    return refractionCorrection;
}

/**
 * Calculate the time in the UTC timezone when the sun transits the specificed zenith
 * @param observer - An observer viewing the sun at a specific, latitude, longitude and elevation
 * @param date - The date to calculate for
 * @param zenith - The zenith angle for which to calculate the transit time
 * @param direction - The direction that the sun is traversing
 * @returns The time when the sun transits the specificed zenith
 */
function timeOfTransit(
    observer: Observer,
    date: DateTime,
    zenith: number,
    direction: SunDirection
): DateTime {
    let latitude: number;
    if (observer.latitude > 89.8) {
        latitude = 89.8;
    } else if (observer.latitude < -89.8) {
        latitude = -89.8;
    } else {
        latitude = observer.latitude;
    }

    let adjustment_for_elevation = 0.0;
    if (typeof observer.elevation == 'number' && observer.elevation > 0.0) {
        adjustment_for_elevation = adjustToHorizon(observer.elevation);
    } else if (observer.elevation instanceof Array) {
        adjustment_for_elevation = adjustToObscuringFeature(observer.elevation);
    }

    let adjustment_for_refraction = refractionAtZenith(
        zenith + adjustment_for_elevation
    );

    let jd = julianDayNumber(date);
    let t = julianDayNumberToJulianCentury(jd);
    let solarDec = sunDeclination(t);

    let hourangle = hourAngle(
        latitude,
        solarDec,
        zenith + adjustment_for_elevation - adjustment_for_refraction,
        direction
    );

    let delta = -observer.longitude - _toDegrees(hourangle);
    let timeDiff = 4.0 * delta;
    let timeUTC = 720.0 + timeDiff - eqOfTime(t);

    t = julianDayNumberToJulianCentury(
        julianCenturyToJulianDayNumber(t) + timeUTC / 1440.0
    );
    solarDec = sunDeclination(t);
    hourangle = hourAngle(
        latitude,
        solarDec,
        zenith + adjustment_for_elevation + adjustment_for_refraction,
        direction
    );

    delta = -observer.longitude - _toDegrees(hourangle);
    timeDiff = 4.0 * delta;
    timeUTC = 720 + timeDiff - eqOfTime(t);

    // let td = minutes_to_timedelta(timeUTC);
    let dt = DateTime.utc(date.year, date.month, date.day).plus({
        minutes: timeUTC
    });
    // dt = pytz.utc.localize(dt);
    return dt;
}

/**
 * Calculates the time when the sun is at the specified elevation on the specified date.
 *
 * Note:
 *     This method uses positive elevations for those above the horizon.
 *     Elevations greater than 90 degrees are converted to a setting sun
 *     i.e. an elevation of 110 will calculate the time for a setting sun at 70 degrees.
 *
 * @param observer - Observer to calculate for
 * @param elevation - Elevation of the sun in degrees above the horizon to calculate for.
 * @param date - Date to calculate for. Default is today's date in the timezone `tzinfo`.
 * @param direction - Determines whether the calculated time is for the sun rising or setting.
 *                    Use `SunDirection.RISING` or `SunDirection.SETTING`. Default is rising.
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns Date and time at which the sun is at the specified elevation.
 */
function timeAtElevation(
    observer: Observer,
    elevation: number,
    date?: DateTime,
    direction: SunDirection = SunDirection.RISING,
    tzinfo: string = 'utc'
): DateTime {
    if (elevation > 90.0) {
        elevation = 180.0 - elevation;
        direction = SunDirection.SETTING;
    }

    if (!date) {
        date = today(tzinfo);
    }

    let zenith = 90 - elevation;
    try {
        let tot = timeOfTransit(observer, date, zenith, direction);
        if (tzinfo != null) {
            tot = tot.setZone(tzinfo);
        }
        return tot;
    } catch (error) {
        if (error instanceof MathError) {
            throw new ValueError(
                `Sun never reaches an elevation of ${elevation} degrees at this location.`
            );
        } else {
            throw error;
        }
    }
}

/**
 * Calculate solar noon time when the sun is at its highest point.
 * @param observer - An observer viewing the sun at a specific, latitude, longitude and elevation
 * @param date - Date to calculate for. Default is today for the specified tzinfo.
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns Date and time at which noon occurs.
 */
function noon(
    observer: Observer,
    date: DateTime | null = null,
    tzinfo: string = 'utc'
): DateTime {
    if (!date) {
        date = today(tzinfo);
    }

    let jc = julianDayNumberToJulianCentury(julianDayNumber(date));
    let eqtime = eqOfTime(jc);
    let timeUTC = (720.0 - 4 * observer.longitude - eqtime) / 60.0;

    let hour = Math.floor(timeUTC);
    let minute = Math.floor((timeUTC - hour) * 60);
    let second = Math.floor(((timeUTC - hour) * 60 - minute) * 60);

    if (second > 59) {
        second -= 60;
        minute += 1;
    } else if (second < 0) {
        second += 60;
        minute -= 1;
    }

    if (minute > 59) {
        minute -= 60;
        hour += 1;
    } else if (minute < 0) {
        minute += 60;
        hour -= 1;
    }

    if (hour > 23) {
        hour -= 24;
        date.plus({ days: 1 });
    } else if (hour < 0) {
        hour += 24;
        date.minus({ days: 1 });
    }

    let noon = DateTime.utc(
        date.year,
        date.month,
        date.day,
        hour,
        minute,
        second
    );
    if (tzinfo != null) {
        noon = noon.setZone(tzinfo);
    }
    return noon;
}

/**
 * Calculate solar midnight time.
 *
 * Note:
 *    This calculates the solar midnight that is closest
 *    to 00:00:00 of the specified date i.e. it may return a time that is on
 *    the previous day.
 *
 * @param observer - An observer viewing the sun at a specific, latitude, longitude and elevation
 * @param date - Date to calculate for. Default is today for the specified tzinfo.
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns Date and time at which midnight occurs.
 */
function midnight(
    observer: Observer,
    date?: DateTime,
    tzinfo: string = 'utc'
): DateTime {
    if (!date) {
        date = today(tzinfo);
    }

    let jd = julianDayNumber(date);
    let newt = julianDayNumberToJulianCentury(
        jd + 0.5 + -observer.longitude / 360.0
    );

    let eqtime = eqOfTime(newt);
    let timeUTC = -observer.longitude * 4.0 - eqtime;

    timeUTC = timeUTC / 60.0;
    let hour = Math.floor(timeUTC);
    let minute = Math.floor((timeUTC - hour) * 60);
    let second = Math.floor(((timeUTC - hour) * 60 - minute) * 60);

    if (second > 59) {
        second -= 60;
        minute += 1;
    } else if (second < 0) {
        second += 60;
        minute -= 1;
    }

    if (minute > 59) {
        minute -= 60;
        hour += 1;
    } else if (minute < 0) {
        minute += 60;
        hour -= 1;
    }

    if (hour < 0) {
        hour += 24;
        date.minus({ days: 1 });
    }

    let midnight = DateTime.utc(
        date.year,
        date.month,
        date.day,
        hour,
        minute,
        second
    );
    if (tzinfo != null) {
        midnight = midnight.setZone(tzinfo);
    }
    return midnight;
}

function zenithAndAzimuth(
    observer: Observer,
    dateandtime: DateTime,
    with_refraction: boolean = true
): [number, number] {
    let latitude;
    if (observer.latitude > 89.8) {
        latitude = 89.8;
    } else if (observer.latitude < -89.8) {
        latitude = -89.8;
    } else {
        latitude = observer.latitude;
    }

    let longitude = observer.longitude;

    let utc_datetime, zone;
    if (dateandtime.zoneName == 'UTC') {
        zone = 0.0;
        utc_datetime = dateandtime;
    } else {
        zone = -dateandtime.offset / 60.0; // type: ignore
        utc_datetime = dateandtime.setZone('utc');
    }

    let timenow =
        utc_datetime.hour +
        utc_datetime.minute / 60.0 +
        utc_datetime.second / 3600.0;

    let JD = julianDayNumber(dateandtime);
    let t = julianDayNumberToJulianCentury(JD + timenow / 24.0);
    let solarDec = sunDeclination(t);
    let eqtime = eqOfTime(t);

    let solarTimeFix = eqtime - 4.0 * -longitude + 60 * zone;
    let trueSolarTime =
        dateandtime.hour * 60.0 +
        dateandtime.minute +
        dateandtime.second / 60.0 +
        solarTimeFix;

    //    in minutes as a float, fractional part is seconds

    while (trueSolarTime > 1440) {
        trueSolarTime = trueSolarTime - 1440;
    }

    let hourangle = trueSolarTime / 4.0 - 180.0;
    //    Thanks to Louis Schwarzmayr for the next line:
    if (hourangle < -180) {
        hourangle = hourangle + 360.0;
    }

    let harad = _toRadians(hourangle);

    let csz =
        Math.sin(_toRadians(latitude)) * Math.sin(_toRadians(solarDec)) +
        Math.cos(_toRadians(latitude)) *
            Math.cos(_toRadians(solarDec)) *
            Math.cos(harad);

    if (csz > 1.0) {
        csz = 1.0;
    } else if (csz < -1.0) {
        csz = -1.0;
    }

    let azimuth;
    let zenith = _toDegrees(Math.acos(csz));
    let azDenom = Math.cos(_toRadians(latitude)) * Math.sin(_toRadians(zenith));

    if (Math.abs(azDenom) > 0.001) {
        let azRad =
            (Math.sin(_toRadians(latitude)) * Math.cos(_toRadians(zenith)) -
                Math.sin(_toRadians(solarDec))) /
            azDenom;

        if (Math.abs(azRad) > 1.0) {
            if (azRad < 0) {
                azRad = -1.0;
            } else {
                azRad = 1.0;
            }
        }

        azimuth = 180.0 - _toDegrees(Math.acos(azRad));

        if (hourangle > 0.0) {
            azimuth = -azimuth;
        }
    } else {
        if (latitude > 0.0) {
            azimuth = 180.0;
        } else {
            azimuth = 0.0;
        }
    }

    if (azimuth < 0.0) {
        azimuth = azimuth + 360.0;
    }

    if (with_refraction) {
        zenith -= refractionAtZenith(zenith);
    }

    return [zenith, azimuth];
}

/**
 * Calculate the azimuth angle of the sun.
 *
 * @param observer - Observer to calculate the solar azimuth for
 * @param dateandtime - The date and time for which to calculate the angle.
 *                      If `dateandtime` is not provided
 *                      then it is assumed to be right [[now]] in the UTC timezone.
 * @returns The azimuth angle in degrees clockwise from North.
 */
function azimuth(observer: Observer, dateandtime?: DateTime): number {
    if (!dateandtime) {
        dateandtime = now('utc');
    }

    return zenithAndAzimuth(observer, dateandtime)[1];
}

/**
 * Calculate the zenith angle of the sun.
 *
 * @param observer - Observer to calculate the solar zenith for
 * @param dateandtime - The date and time for which to calculate the angle.
 *                      If `dateandtime` is not provided
 *                      then it is assumed to be right [[now]] in the UTC timezone.
 * @param with_refraction - If true adjust zenith to take refraction into account
 * @returns The zenith angle in degrees.
 */
function zenith(
    observer: Observer,
    dateandtime: DateTime | null,
    with_refraction: boolean = true
): number {
    if (!dateandtime) {
        dateandtime = now('utc');
    }

    return zenithAndAzimuth(observer, dateandtime, with_refraction)[0];
}

/**
 * Calculate the sun's angle of elevation.
 *
 * @param observer - Observer to calculate the solar elevation for
 * @param dateandtime - The date and time for which to calculate the angle.
 *                      If `dateandtime` is not provided then it is assumed to be right
 *                      [[now]] in the UTC timezone.
 * @param with_refraction - If true adjust zenith to take refraction into account
 * @returns The elevation angle in degrees.
 */
function elevation(
    observer: Observer,
    dateandtime?: DateTime,
    with_refraction: boolean = true
): number {
    if (!dateandtime) {
        dateandtime = now('utc');
    }

    return 90.0 - zenith(observer, dateandtime, with_refraction);
}

/**
 * Calculate dawn time.
 *
 * @param observer - Observer to calculate dawn for
 * @param date - Date to calculate for. Default is today's date in the timezone `tzinfo`.
 * @param depression - Number of degrees below the horizon to use to calculate dawn.
 *                     Default is for Civil dawn i.e. 6.0
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns Date and time at which dawn occurs.
 * @throws [[ValueError]] if dawn does not occur on the specified date
 */
function dawn(
    observer: Observer,
    date?: DateTime,
    depression: number = Depression.CIVIL,
    tzinfo: string = 'utc'
): DateTime {
    if (!date) {
        date = today(tzinfo);
    }

    // TODO: Handle enum
    let dep: number = 0.0;
    // console.log(typeof depression);
    // if (typeof depression == "Depression"){
    //     dep = depression.value; }
    // else {
    dep = depression;
    // }

    try {
        return timeOfTransit(
            observer,
            date,
            90.0 + dep,
            SunDirection.RISING
        ).setZone(tzinfo);
    } catch (error) {
        if (error instanceof MathError) {
            throw new ValueError(
                `Sun never reaches ${dep} degrees below the horizon, at this location.`
            );
        } else {
            throw error;
        }
    }
}

/**
 * Calculate sunrise time.
 *
 * @param observer - Observer to calculate sunrise for
 * @param date - Date to calculate for. Default is today's date in the timezone `tzinfo`.
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns Date and time at which sunrise occurs.
 * @throws [[ValueError]] if the sun does not reach the horizon
 */
function sunrise(
    observer: Observer,
    date?: DateTime,
    tzinfo: string = 'utc'
): DateTime {
    tzinfo = tzinfo || 'utc';
    date = date || today(tzinfo);

    try {
        return timeOfTransit(
            observer,
            date,
            90.0 + SUN_APPARENT_RADIUS,
            SunDirection.RISING
        ).setZone(tzinfo);
    } catch (error) {
        let msg: string;
        if (error instanceof MathError) {
            let z = zenith(observer, noon(observer, date));
            if (z > 90.0) {
                msg =
                    'Sun is always below the horizon on this day, at this location.';
            } else {
                msg =
                    'Sun is always above the horizon on this day, at this location.';
            }
            throw new ValueError(msg);
        } else {
            throw error;
        }
    }
}

/**
 * Calculate sunset time.
 *
 * @param observer - Observer to calculate sunset for
 * @param date - Date to calculate for. Default is today's date in the timezone `tzinfo`.
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns Date and time at which sunset occurs.
 * @throws [[ValueError]] if the sun does not reach the horizon
 */
function sunset(
    observer: Observer,
    date?: DateTime,
    tzinfo: string = 'utc'
): DateTime {
    if (!date) {
        date = today(tzinfo);
    }

    try {
        return timeOfTransit(
            observer,
            date,
            90.0 + SUN_APPARENT_RADIUS,
            SunDirection.SETTING
        ).setZone(tzinfo);
    } catch (error) {
        let msg: string;
        if (error instanceof MathError) {
            let z = zenith(observer, noon(observer, date));
            if (z > 90.0) {
                msg =
                    'Sun is always below the horizon on this day, at this location.';
            } else {
                msg =
                    'Sun is always above the horizon on this day, at this location.';
            }
            throw new ValueError(msg);
        } else {
            throw error;
        }
    }
}

/**
 * Calculate dusk time.
 * @param observer - Observer to calculate dusk for
 * @param date - Date to calculate for. Default is today's date in the timezone `tzinfo`.
 * @param depression - Number of degrees below the horizon to use to calculate dusk. Default is for Civil dusk i.e. 6.0
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns Date and time at which dusk occurs.
 * @throws [[ValueError]] if dusk does not occur on the specified date
 */
function dusk(
    observer: Observer,
    date?: DateTime,
    depression: number = Depression.CIVIL,
    tzinfo: string = 'utc'
): DateTime {
    if (!date) {
        date = today(tzinfo);
    }

    let dep: number = 0.0;
    // if (typeof depression == "Depression") {
    //     dep = depression.value;
    // }
    // else {
    dep = depression;
    // }

    try {
        return timeOfTransit(
            observer,
            date,
            90.0 + dep,
            SunDirection.SETTING
        ).setZone(tzinfo);
    } catch (error) {
        if (error instanceof MathError) {
            throw new ValueError(
                `Sun never reaches ${dep} degrees below the horizon, at this location.`
            );
        } else {
            throw error;
        }
    }
}

/**
 * Calculate daylight start and end times.
 * @param observer - Observer to calculate daylight for
 * @param date - Date to calculate for. Default is today's date in the timezone `tzinfo`.
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns A tuple of the date and time at which daylight starts and ends.
 * @throws [[ValueError]] if the sun does not rise or does not set
 */
function daylight(
    observer: Observer,
    { date, tzinfo = 'utc' }: { date?: DateTime; tzinfo?: string } = {}
): [DateTime, DateTime] {
    if (!date) {
        date = today(tzinfo);
    }

    let start = sunrise(observer, date, tzinfo);
    let end = sunset(observer, date, tzinfo);

    return [start, end];
}

/**
 * Calculate night start and end times.
 *
 * Night is calculated to be between astronomical dusk on the
 * date specified and astronomical dawn of the next day.
 *
 * @param observer - Observer to calculate night for
 * @param date - Date to calculate for. Default is today's date for the specified tzinfo.
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns A tuple of the date and time at which night starts and ends.
 * @throws [[ValueError]] if dawn does not occur on the specified date or dusk on the following day
 */
function night(
    observer: Observer,
    { date, tzinfo = 'utc' }: { date?: DateTime; tzinfo?: string } = {}
): [DateTime, DateTime] {
    if (!date) {
        date = today(tzinfo);
    }

    let start = dusk(observer, date, 6, tzinfo);
    let tomorrow = date.plus({ days: 1 });
    let end = dawn(observer, tomorrow, 6, tzinfo);

    return [start, end];
}

/**
 * Returns the start and end times of Twilight
 *
 * This method defines twilight as being between the time
 * when the sun is at -6 degrees and sunrise/sunset.
 *
 * @param observer - Observer to calculate twilight for when the sun is traversing in the specified direction.
 * @param date - Date for which to calculate the times. Default is today's date in the timezone `tzinfo`.
 * @param direction - Determines whether the time is for the sun rising or setting. Use `SunDirection.RISING` or `SunDirection.SETTING`.
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns A tuple of the date and time at which twilight starts and ends.
 * @throws [[ValueError]] if the sun does not rise or does not set
 */
function twilight(
    observer: Observer,
    {
        date,
        direction = SunDirection.RISING,
        tzinfo = 'utc'
    }: { date?: DateTime; direction?: SunDirection; tzinfo?: string } = {}
): [DateTime, DateTime] {
    if (!date) {
        date = today(tzinfo);
    }

    let start = timeOfTransit(observer, date, 90 + 6, direction).setZone(
        tzinfo
    );
    let end;
    if (direction == SunDirection.RISING) {
        end = sunrise(observer, date, tzinfo).setZone(tzinfo);
    } else {
        end = sunset(observer, date, tzinfo).setZone(tzinfo);
    }

    if (direction == SunDirection.RISING) {
        return [start, end];
    } else {
        return [end, start];
    }
}

/**
 * Returns the start and end times of the Golden Hour
 * when the sun is traversing in the specified direction.
 *
 * This method uses the definition from
 * [PhotoPills](https://www.photopills.com/articles/understanding-golden-hour-blue-hour-and-twilights)
 * i.e. the golden hour is when the sun is between 4 degrees below the horizon
 * and 6 degrees above.
 *
 * @param observer - Observer to calculate the golden hour for
 * @param date - Date for which to calculate the times. Default is today's date in the timezone `tzinfo`.
 * @param direction - Determines whether the time is for the sun rising or setting. Use `SunDirection.RISING` or `SunDirection.SETTING`.
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns A tuple of the date and time at which the Golden Hour starts and ends.
 * @throws [[ValueError]] if the sun does not transit the elevations -4 & +6 degrees
 */
function goldenHour(
    observer: Observer,
    {
        date,
        direction = SunDirection.RISING,
        tzinfo = 'utc'
    }: { date?: DateTime; direction?: SunDirection; tzinfo?: string } = {}
): [DateTime, DateTime] {
    if (!date) {
        date = today(tzinfo);
    }

    let start, end;
    try {
        start = timeOfTransit(observer, date, 90 + 4, direction).setZone(
            tzinfo
        );
        end = timeOfTransit(observer, date, 90 - 6, direction).setZone(tzinfo);
    } catch (error) {
        if (error instanceof MathError) {
            throw new ValueError(
                'Sun does not transit the elevations -4 & +6 degrees at this location'
            );
        }
    }

    if (direction == SunDirection.RISING) {
        return [start, end];
    } else {
        return [end, start];
    }
}

/**
 * Returns the start and end times of the Blue Hour when the sun is traversing in the specified direction.
 * 
 * This method uses the definition from PhotoPills i.e. the
 * blue hour is when the sun is between 6 and 4 degrees below the horizon.

 * @param observer - Observer to calculate the blue hour for
 * @param date - Date for which to calculate the times. Default is today's date in the timezone `tzinfo`.
 * @param direction - Determines whether the time is for the sun rising or setting. Use `SunDirection.RISING` or `SunDirection.SETTING`.
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns A tuple of the date and time at which the Blue Hour starts and ends.
 * @throws [[ValueError]] if the sun does not transit the elevations -4 & -6 degrees
 */
function blueHour(
    observer: Observer,
    {
        date,
        direction = SunDirection.RISING,
        tzinfo = 'utc'
    }: { date?: DateTime; direction?: SunDirection; tzinfo?: string } = {}
): [DateTime, DateTime] {
    if (!date) {
        date = today(tzinfo);
    }

    let start, end;
    try {
        start = timeOfTransit(observer, date, 90 + 6, direction).setZone(
            tzinfo
        );
        end = timeOfTransit(observer, date, 90 + 4, direction).setZone(tzinfo);
    } catch (error) {
        if (error instanceof MathError) {
            throw new ValueError(
                'Sun does not transit the elevations -4 & -6 degrees at this location'
            );
        }
    }

    if (direction == SunDirection.RISING) {
        return [start, end];
    } else {
        return [end, start];
    }
}

/**
 * Calculate ruhakaalam times.
 * @param observer - Observer to calculate rahukaalam for
 * @param date - Date to calculate for. Default is today's date in the timezone `tzinfo`.
 * @param daytime - If True calculate for the day time else calculate for the night time.
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns Tuple containing the start and end times for Rahukaalam.
 * @throws [[ValueError]] if the sun does not rise or does not set
 */
function rahukaalam(
    observer: Observer,
    {
        date,
        daytime = true,
        tzinfo = 'utc'
    }: { date?: DateTime; daytime?: boolean; tzinfo?: string } = {}
): [DateTime, DateTime] {
    if (!date) {
        date = today(tzinfo);
    }

    let start, end;
    if (daytime) {
        start = sunrise(observer, date, tzinfo);
        end = sunset(observer, date, tzinfo);
    } else {
        start = sunset(observer, date, tzinfo);
        end = sunrise(observer, date.plus({ days: 1 }), tzinfo);
    }

    let octant_duration = (end - start) / 8;

    // Mo,Sa,Fr,We,Th,Tu,Su
    let octant_index = [1, 6, 4, 5, 3, 2, 7];

    let weekday = date.weekday;
    let octant = octant_index[weekday];

    start = start.plus({ second: octant_duration * octant });
    end = start.plus({ second: octant_duration });

    return [start, end];
}

/**
 * Calculate dawn, sunrise, noon, sunset and dusk for the sun.
 *
 * @param observer - Observer for which to calculate the times of the sun
 * @param date - Date to calculate for. Default is today's date in the timezone `tzinfo`.
 * @param dawn_dusk_depression - Depression to use to calculate dawn and dusk. Default is for Civil dusk i.e. 6.0
 * @param tzinfo - Timezone to return times in. Default is UTC.
 * @returns Object with keys `dawn`, `sunrise`, `noon`, `sunset` and `dusk` whose values are the results of the corresponding functions.
 * @throws [[ValueError]] if thrown by any of the functions
 */
function sun(
    observer: Observer,
    {
        date,
        dawn_dusk_depression = Depression.CIVIL,
        tzinfo = 'utc'
    }: { date?: DateTime; dawn_dusk_depression?: number; tzinfo?: string } = {}
): Object {
    if (!date) {
        date = today(tzinfo);
    }

    return {
        dawn: dawn(observer, date, dawn_dusk_depression, tzinfo),
        sunrise: sunrise(observer, date, tzinfo),
        noon: noon(observer, date, tzinfo),
        sunset: sunset(observer, date, tzinfo),
        dusk: dusk(observer, date, dawn_dusk_depression, tzinfo)
    };
}

function _toRadians(degrees: number): number {
    return degrees * (Math.PI / 180.0);
}

function _toDegrees(radians: number): number {
    return radians * (180.0 / Math.PI);
}

export {
    julianDayNumber,
    dawn,
    dusk,
    sunrise,
    sunset,
    sun,
    rahukaalam,
    timeAtElevation,
    timeOfTransit,
    goldenHour,
    blueHour,
    twilight,
    daylight,
    night,
    elevation,
    azimuth,
    zenith,
    noon,
    midnight
};
