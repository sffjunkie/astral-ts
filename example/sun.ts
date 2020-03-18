#!npx ts-node
import { DateTime } from "luxon";
import { sun, LocationInfo } from "../dist/index";

let city = new LocationInfo("London", "England", "Europe/London", 51.5, -0.116);
console.log(`Information for ${city.name}/${city.region}
Timezone: ${city.timezone}
Latitude: ${city.latitude}; Longitude: ${city.longitude}
`);

let s = sun.sun(city.observer, DateTime.fromObject({year: 2009, month: 4, day: 22}));
console.log(`Dawn:    ${s["dawn"].toISO()}
Sunrise: ${s["sunrise"].toISO()}
Noon:    ${s["noon"].toISO()}
Sunset:  ${s["sunset"].toISO()}
Dusk:    ${s["dusk"].toISO()}`);
