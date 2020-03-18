#!npx ts-node
import { addLocations, database, lookup } from "../dist/geocoder";
let db = database();
try {
    lookup("Somewhere", db);
} catch(err) {
    console.log(err.message);
}
addLocations("Somewhere,Secret Location,UTC,24°28'N,39°36'E", db);
console.log(lookup("Somewhere", db));
