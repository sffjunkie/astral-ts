#!npx ts-node
import { DateTime } from "luxon";
import { phase } from "../dist/moon";
console.log(phase(DateTime.fromObject({year: 2018, month: 1, day: 1})));
