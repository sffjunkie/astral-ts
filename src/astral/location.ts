import { IANAZone } from "luxon";
import { Depression, LocationInfo, Observer, dmsToNumber } from "./index";

/**
 * Provides access to information for single location.
 */
class Location {
    location_info: LocationInfo;
    solar_depression: number;

    constructor(info?: LocationInfo) {
        this.solar_depression = Depression.CIVIL;

        if (info) {
            this.location_info = info;
        } else {
            this.location_info = LocationInfo.fromObject({
                name: "Greenwich",
                region: "England",
                timezone: "Europe/London",
                latitude: 51.4733,
                longitude: -0.00083333
            });
        }
    }

    get info(): LocationInfo {
        return this.location_info;
    }

    get observer(): Observer {
        return new Observer(
            this.location_info.latitude,
            this.location_info.longitude,
            0.0
        );
    }

    get name(): string {
        return this.location_info.name;
    }

    set name(value: string) {
        this.location_info.name = value;
    }

    get region(): string {
        return this.location_info.region;
    }

    set region(value: string) {
        this.location_info.region = value;
    }

    get timezone(): string {
        return this.location_info.timezone;
    }

    set timezone(value: string) {
        this.location_info.timezone = value;
    }

    get latitude(): any {
        return this.location_info.latitude;
    }

    set latitude(value: any) {
        this.location_info.latitude = dmsToNumber(value);
    }

    get longitude(): any {
        return this.location_info.longitude;
    }

    set longitude(value: any) {
        this.location_info.longitude = dmsToNumber(value);
    }

    get tzinfo():IANAZone {
        return new IANAZone(this.location_info.timezone);
    }
}

export { Location };
