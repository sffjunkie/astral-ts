// Copyright 2009-2020, Simon Kennedy, sffjunkie+code@gmail.com

//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.

import { DateTime } from 'luxon';
import * as geocoder from './geocoder';
import * as sun from './sun';
import * as moon from './moon';
import { Location } from './location';

type Elevation = number | [number, number];

/**
 * Returns the current time in the specified time zone
 * @param timezone - The timezone to use
 */
function now(timezone: string = 'utc'): DateTime {
    let time = DateTime.utc();
    if (timezone !== 'utc') {
        time = time.setZone(timezone);
    }
    return time;
}

/**
 * Returns the current date in the specified time zone
 * @param timezone - The timezone to use
 */
function today(timezone: string = 'utc'): DateTime {
    let dt = now(timezone);
    dt.set({ hour: 0, minute: 0, second: 0 });
    return dt;
}

/**
 * Converts as string of the form `degrees°minutes'seconds"[N|S|E|W]`, or a number encoded as a string, to a number
 *
 *   N and E return positive values
 *   S and W return negative values
 *
 * @param dms - string to convert
 * @param limit - Limit the value between ± `limit` (if provided)
 */
function dmsToNumber(dms: string | number, limit?: number): number {
    if (dms === undefined) {
        console.log('2');
    }

    let res: number;
    res = Number(dms);
    if (isNaN(res)) {
        let re = /(?<deg>\d{1,3})[°]?((?<min>\d{1,2})[′'])?((?<sec>\d{1,2})[″\"])?(?<dir>[NSEW])?/i;
        let m = dms.toString().match(re);
        if (m === null) {
            throw {
                type: 'ValueError',
                msg: `Unable to convert ${dms} to a float`
            };
        }

        let deg = m.groups['deg'] || '0.0';
        let min_ = m.groups['min'] || '0.0';
        let sec = m.groups['sec'] || '0.0';
        let dir_ = m.groups['dir'] || 'E';

        res = parseFloat(deg);
        if (min_) res += parseFloat(min_) / 60;
        if (sec) res += parseFloat(sec) / 3600;

        dir_ = dir_.toUpperCase();
        if (dir_ === 'S' || dir_ === 'W') {
            res = -res;
        }
    }

    if (limit) {
        if (res > limit) res = limit;
        else if (res < -limit) res = -limit;
    }
    return res;
}

/**
 * The depression angle in degrees for the dawn/dusk calculations
 */
enum Depression {
    CIVIL = 6.0,
    NAUTICAL = 12.0,
    ASTRONOMICAL = 18.0
}

/**
 * Direction of the sun either RISING or SETTING
 */
enum SunDirection {
    RISING = 1,
    SETTING = -1
}

/**
 * Defines the location of an observer on Earth.

 * Latitude and longitude can be set either as a float or as a string.
 * For strings they must be of the form
 *
 *     degrees°minutes'seconds"[N|S|E|W] e.g. 51°31'N
 *
 * `minutes’` & `seconds”` are optional.
 *
 * Elevations are optional and are either
 *
 * <ul>
 * <li>A float that is the elevation in metres above a location, if the nearest
 *     obscuring feature is the horizon</li>
 * <li>or a tuple of the elevation in metres and the distance in metres to the
      nearest obscuring feature.</li>
 * </ul>
 */
class Observer {
    latitude: number;
    longitude: number;
    elevation: Elevation;
    /**
     * Constructor
     * @param latitude - Latitude - Northern latitudes should be positive
     * @param longitude - Longitude - Eastern longitudes should be positive
     * @param elevation - Elevation and/or distance to nearest obscuring feature
                          in metres above/below the location.
     */
    constructor(
        latitude?: number | string,
        longitude?: number | string,
        elevation?: Elevation
    ) {
        if (latitude) {
            this.latitude = dmsToNumber(latitude, 90.0);
        } else {
            this.latitude = 51.4733;
        }
        if (longitude) {
            this.longitude = dmsToNumber(longitude, 180.0);
        } else {
            this.longitude = -0.0008333;
        }
        if (elevation) {
            this.elevation = elevation;
        } else {
            this.elevation = 0.0;
        }
    }

    public static fromObject(obj: Object): Observer {
        let n = new Observer();
        if ('latitude' in obj) n.latitude = dmsToNumber(obj['latitude'], 90.0);
        if ('longitude' in obj)
            n.longitude = dmsToNumber(obj['longitude'], 90.0);
        if ('elevation' in obj) n.elevation = obj['elevation'];
        return n;
    }
}

class LocationInfo {
    latitude: number;
    longitude: number;
    /**
     * Constructor
     * @param name - Location name (can be any string)
     * @param region - Region location is in (can be any string)
     * @param timezone - The location's time zone
     * @param latitude - Latitude - Northern latitudes should be positive
     * @param longitude - Longitude - Eastern longitudes should be positive
     */
    constructor(
        public name?: string,
        public region?: string,
        public timezone?: string,
        latitude?: number | string,
        longitude?: number | string
    ) {
        if (name) {
            this.name = name;
        } else {
            this.name = 'Greenwich';
        }
        if (region) {
            this.region = region;
        } else {
            this.region = 'England';
        }
        if (timezone) {
            this.timezone = timezone;
        } else {
            this.timezone = 'Europe/London';
        }
        if (latitude) {
            this.latitude = dmsToNumber(latitude, 90.0);
        } else {
            this.latitude = 51.4733;
        }
        if (longitude) {
            this.longitude = dmsToNumber(longitude, 180.0);
        } else {
            this.longitude = -0.0008333;
        }
    }

    public static fromObject(obj: Object): LocationInfo {
        let n = new LocationInfo();
        if ('name' in obj) n.name = obj['name'];
        if ('region' in obj) n.region = obj['region'];
        if ('timezone' in obj) n.timezone = obj['timezone'];
        if ('latitude' in obj) n.latitude = dmsToNumber(obj['latitude'], 90.0);
        if ('longitude' in obj)
            n.longitude = dmsToNumber(obj['longitude'], 180.0);
        return n;
    }

    /** Get an observer instance for this location */
    get observer(): Observer {
        return new Observer(this.latitude, this.longitude, 0.0);
    }

    /** Get the timezone group for this location */
    get timezone_group(): string {
        return this.timezone.split('/')[0];
    }
}

export {
    Elevation,
    dmsToNumber,
    Observer,
    LocationInfo,
    SunDirection,
    Depression,
    now,
    today,
    sun,
    moon,
    geocoder,
    Location
};
