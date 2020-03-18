#!npx ts-node
import { database, location } from "../dist/geocoder";
console.log(location("London", database()));
