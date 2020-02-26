# Calculations for the position of the sun and moon

[![Build Status](https://travis-ci.org/sffjunkie/astral.svg?branch=master)](https://travis-ci.org/sffjunkie/astral)

Astral is a typescript package for calculating the times of various aspects of
the sun and phases of the moon.

It can calculate the following

Dawn
: The time in the morning when the sun is a specific number of degrees below the horizon.

Sunrise
: The time in the morning when the top of the sun breaks the horizon (asuming a location with no obscuring features.)

Noon
    The time when the sun is at its highest point directly above the observer.

Midnight
    The time when the sun is at its lowest point.

Sunset
    The time in the evening when the sun is about to disappear below the
    horizon (asuming a location with no obscuring features.)

Dusk
    The time in the evening when the sun is a specific number of degrees
    below the horizon.

Daylight
   The time when the sun is up i.e. between sunrise and sunset

Night
   The time between astronomical dusk of one day and astronomical dawn of the
   next

Twilight
   The time between dawn and sunrise or between sunset and dusk

The Golden Hour
   The time when the sun is between 4 degrees below the horizon and 6 degrees
   above.

The Blue Hour
   The time when the sun is between 6 and 4 degrees below the horizon.

Time At Elevation
   the time when the sun is at a specific elevation for either a rising or a
   setting sun.

Solar Azimuth
    The number of degrees clockwise from North at which the sun can be seen

Solar Zenith
    The angle of the sun down from directly above the observer

Solar Elevation
    The number of degrees up from the horizon at which the sun can be seen

`Rahukaalam`_
    "Rahukaalam or the period of Rahu is a certain amount of time every day
    that is considered inauspicious for any new venture according to Indian
    Vedic astrology".

Moon Phase
    The phase of the moon for a specified date.

Astral also comes with a geocoder containing a local database that allows you
to look up information for a small set of locations (`new locations can be
added <additional_locations_>`__).

!!! note
    The Google Geocoder has been removed. Instead you should use the
    Google Client for Google Maps Services
    https://github.com/googlemaps/google-maps-services-python

## Examples

The following examples demonstrates some of the functionality available in the
module

### Sun

```
> import { LocationInfo } from "astral";
> city = LocationInfo("London", "England", "Europe/London", 51.5, -0.116);
> console.log(
... `Information for ${city.name}/${city.region}
... Timezone: ${city.timezone}
... Latitude: ${city.latitude:.02f}; Longitude: ${city.longitude:.02f}`
... ));

Information for London/England
Timezone: Europe/London
Latitude: 51.50; Longitude: -0.12

> import { DateTime } from "luxon";
> import { sun } from "astral/sun";
> s = sun(city.observer, date=datetime.date(2009, 4, 22));
> console.log(
... `Dawn:    ${s.dawn}
... Sunrise: ${s.sunrise}
... Noon:    ${s.noon}
... Sunset:  ${s.sunset}
... Dusk:    ${s.dusk}`
... );

Dawn:    2009-04-22 04:13:04.923309+00:00
Sunrise: 2009-04-22 04:50:16.515411+00:00
Noon:    2009-04-22 11:59:02+00:00
Sunset:  2009-04-22 19:08:41.215821+00:00
Dusk:    2009-04-22 19:46:06.362457+00:00
```

### Moon

```
> import { DateTime } from "luxon";
> import { phase } from "astral/moon";
> moon.phase(datetime.date(2018, 1, 1))
13.255666666666668
```

The moon phase method returns an number describing the phase, where the value
is between 0 and 27.99. The following lists the mapping of various values to
the description of the phase of the moon.

============  ==============
0 .. 6.99     New moon
7 .. 13.99    First quarter
14 .. 20.99   Full moon
21 .. 27.99   Last quarter
============  ==============

If for example the number returned was 27.99 then the moon would be almost at
the New Moon phase, and if it was 24.00 it would be half way between the Last
Quarter and a New Moon.

!!! note
    The moon phase does not depend on your location. However what the moon
    actually looks like to you does depend on your location. If you're in the
    southern hemisphere it looks different than if you were in the northern
    hemisphere.

    See http://moongazer.x10.mx/website/astronomy/moon-phases/ for an example.

    For an example of using this library to generate moon phases including the
    names in various languages and the correct Unicode glyphs see the
    `project by PanderMusubi <https://github.com/PanderMusubi/lunar-phase-calendar/>`_
    on Github.

### Geocoder

```
> import { database, lookup } from "astral/geocoder";
> lookup("London", database())
LocationInfo(name='London', region='England', timezone='Europe/London',
latitude=51.473333333333336, longitude=-0.0008333333333333334)
```

!!! note
    Location elevations have been removed from the database. These were added
    due to a misunderstanding of the affect of elevation on the times of the
    sun. These are not required for the calculations, only the elevation of the
    observer above/below the location is needed.

    See `Effect of Elevation`_ below.

#### Custom Location

If you only need a single location that is not in the database then you can
construct a :class:`~astral.LocationInfo` and fill in the values, either on
initialization

.. code-block:: python

    from astral import LocationInfo
    l = LocationInfo('name', 'region', 'timezone/name', 0.1, 1.2)

or set the attributes after initialization::

    from astral import LocationInfo
    l = LocationInfo()
    l.name = 'name'
    l.region = 'region'
    l.timezone = 'US/Central'
    l.latitude = 0.1
    l.longitude = 1.2

!!! note
    `name` and `region` can be anything you like.

#### Additional Locations

You can add to the list of available locations using the
:func:`~astral.geocoder.add_locations` function and passing either a string
with one line per location or by passing a list containing strings, lists or
tuples (lists and tuples are passed directly to the LocationInfo constructor).

.. code-block:: python

    >>> from astral.geocoder import add_locations, database, lookup
    >>> db = database()
    >>> try:
    ...     lookup("Somewhere", db)
    ... except KeyError:
    ...     print("Somewhere not found")
    ...
    Somewhere not found
    >>> add_locations("Somewhere,Secret Location,UTC,24°28'N,39°36'E", db)
    >>> lookup("Somewhere", db)
    LocationInfo(name='Somewhere', region='Secret Location', timezone='UTC',
        latitude=24.466666666666665, longitude=39.6)

#### Timezone Groups

Timezone groups such as Europe can be accessed via the :func:`group` function
in the :mod:`~astral.geocoder` module

.. code-block:: python

    >>> from astral.geocoder import group
    >>> europe = group("europe")
    >>> sorted(europe.keys())
    ['aberdeen', 'amsterdam', 'andorra_la_vella', 'ankara', 'athens', ...]

## Effect of Elevation

### Times Of The Sun

The times of the sun that you experience depend on what obscurs your view of
it. It may either be obscured by the horizon or some other geographical
feature (e.g. mountains)

1. If what obscures you at ground level is the horizon and you are at a
   elevation above ground level then the times of the sun depends on how far
   further round the earth you can see due to your elevation (the sun rises
   earlier and sets later).

   The extra angle you can see round the earth is determined by calculating the
   angle α in the image below based on your elevation above ground level,
   and adding this to the depression angle for the sun calculations.

   .. image:: static/elevation_horizon.svg
      :class: adjustment

   .. warning::

      This may not be the correct calculation for the angle round the earth.
      Please raise an `issue`_ if you know how it should be calculated.

2. If your view is obscured by some other geographical feature than the
   horizon, then the adjustment angle is based on how far you are above or
   below the feature and your distance to it.

For the first case i.e. obscured by the horizon you need to pass a single float
to the Observer as its elevation. For the second case pass a tuple of 2
floats. The first being the vertical distance to the top of the feature and
the second the horizontal distance to the feature.

### Elevation Of The Sun

Even though an observer's elevation can significantly affect the times of the
sun the same is not true for the elevation angle from the observer to the sun.

As an example the diagram below shows the difference in angle between an
observer at ground level and one on the ISS orbiting 408 km above the earth.

.. image:: static/elevation_sun.svg
   :class: adjustment

The largest difference between the two angles is when the angle at ground
level is 1 degree. The difference then is approximately 0.15 degrees.

At the summit of mount Everest (8,848 m) the maximum difference is
0.00338821 degrees.

Due to the very small difference the astral package does not currently adjust
the solar elevation for changes in observer elevation.

## Effect of Refraction

When viewing the sun the position you see it at is different from its actual
position due to the effect of atmospheric `refraction`_ which
makes the sun appear to be higher in the sky. The calculations in the
package take this refraction into account.

The :func:`~astral.sun.sunrise` and :func:`~astral.sun.sunset` functions
use the refraction at an angle when the sun is half of its apparent diameter
below the horizon. This is between about 30 and 32 arcminutes and for the
astral package a value of 32" is used.

!!! note
    The refraction calculation does not take into account
    temperature and pressure which can affect the angle of refraction.

## Note on Localized Timezones

When creating a datetime object in a specific timezone do not use the
`tzinfo` parameter to the datetime constructor. Instead use the
:meth:`~pytz.tzinfo.localize` method provided by pytz on the correct pytz
timezone::

   >>> dt = datetime.datetime(2015, 1, 1, 9, 0, 0)
   >>> pytz.timezone('Europe/London').localize(dt)
   datetime.datetime(2015, 1, 1, 9, 0, tzinfo=<DstTzInfo 'Europe/London' GMT0:00:00 STD>)

## License

This module is licensed under the terms of the `Apache`_ V2.0 license.

## Dependencies

Astral has one required external Python dependency on `pytz`.

## Installation

To install Astral you should use the `pip`_ tool::

    pip3 install astral

!!! note
    Now that we are Python 3 only and pip provides a versioned executable on
    Windows you should use the `pip3` command on all operating systems
    to ensure you are targetting the right Python version.

## Cities

The module includes location and time zone data for the following cities.
The list includes all capital cities plus some from the UK. The list also
includes the US state capitals and some other US cities.

Aberdeen, Abu Dhabi, Abu Dhabi, Abuja, Accra, Addis Ababa, Adelaide, Al Jubail,
Albany, Albuquerque, Algiers, Amman, Amsterdam, Anchorage, Andorra la Vella,
Ankara, Annapolis, Antananarivo, Apia, Ashgabat, Asmara, Astana, Asuncion,
Athens, Atlanta, Augusta, Austin, Avarua, Baghdad, Baku, Baltimore, Bamako,
Bandar Seri Begawan, Bangkok, Bangui, Banjul, Barrow-In-Furness, Basse-Terre,
Basseterre, Baton Rouge, Beijing, Beirut, Belfast, Belgrade, Belmopan, Berlin,
Bern, Billings, Birmingham, Birmingham, Bishkek, Bismarck, Bissau,
Bloemfontein, Bogota, Boise, Bolton, Boston, Bradford, Brasilia, Bratislava,
Brazzaville, Bridgeport, Bridgetown, Brisbane, Bristol, Brussels, Bucharest,
Bucuresti, Budapest, Buenos Aires, Buffalo, Bujumbura, Burlington, Cairo,
Canberra, Cape Town, Caracas, Cardiff, Carson City, Castries, Cayenne,
Charleston, Charlotte, Charlotte Amalie, Cheyenne, Chicago, Chisinau,
Cleveland, Columbia, Columbus, Conakry, Concord, Copenhagen, Cotonou, Crawley,
Dakar, Dallas, Damascus, Dammam, Denver, Des Moines, Detroit, Dhaka, Dili,
Djibouti, Dodoma, Doha, Douglas, Dover, Dublin, Dushanbe, Edinburgh, El Aaiun,
Fargo, Fort-de-France, Frankfort, Freetown, Funafuti, Gaborone, George Town,
Georgetown, Gibraltar, Glasgow, Greenwich, Guatemala, Hanoi, Harare,
Harrisburg, Hartford, Havana, Helena, Helsinki, Hobart, Hong Kong, Honiara,
Honolulu, Houston, Indianapolis, Islamabad, Jackson, Jacksonville, Jakarta,
Jefferson City, Jerusalem, Juba, Jubail, Juneau, Kabul, Kampala, Kansas City,
Kathmandu, Khartoum, Kiev, Kigali, Kingston, Kingston, Kingstown, Kinshasa,
Koror, Kuala Lumpur, Kuwait, La Paz, Lansing, Las Vegas, Leeds, Leicester,
Libreville, Lilongwe, Lima, Lincoln, Lisbon, Little Rock, Liverpool, Ljubljana,
Lome, London, Los Angeles, Louisville, Luanda, Lusaka, Luxembourg, Macau,
Madinah, Madison, Madrid, Majuro, Makkah, Malabo, Male, Mamoudzou, Managua,
Manama, Manchester, Manchester, Manila, Maputo, Maseru, Masqat, Mbabane, Mecca,
Medina, Melbourne, Memphis, Mexico, Miami, Milwaukee, Minneapolis, Minsk,
Mogadishu, Monaco, Monrovia, Montevideo, Montgomery, Montpelier, Moroni,
Moscow, Moskva, Mumbai, Muscat, N'Djamena, Nairobi, Nashville, Nassau,
Naypyidaw, New Delhi, New Orleans, New York, Newark, Newcastle, Newcastle Upon
Tyne, Ngerulmud, Niamey, Nicosia, Norwich, Nouakchott, Noumea, Nuku'alofa,
Nuuk, Oklahoma City, Olympia, Omaha, Oranjestad, Orlando, Oslo, Ottawa,
Ouagadougou, Oxford, P'yongyang, Pago Pago, Palikir, Panama, Papeete,
Paramaribo, Paris, Perth, Philadelphia, Phnom Penh, Phoenix, Pierre, Plymouth,
Podgorica, Port Louis, Port Moresby, Port of Spain, Port-Vila, Port-au-Prince,
Portland, Portland, Porto-Novo, Portsmouth, Prague, Praia, Pretoria, Pristina,
Providence, Quito, Rabat, Raleigh, Reading, Reykjavik, Richmond, Riga, Riyadh,
Road Town, Rome, Roseau, Sacramento, Saint Helier, Saint Paul, Saint Pierre,
Saipan, Salem, Salt Lake City, San Diego, San Francisco, San Jose, San Juan,
San Marino, San Salvador, Sana, Sana'a, Santa Fe, Santiago, Santo Domingo, Sao
Tome, Sarajevo, Seattle, Seoul, Sheffield, Singapore, Sioux Falls, Skopje,
Sofia, Southampton, Springfield, Sri Jayawardenapura Kotte, St. George's, St.
John's, St. Peter Port, Stanley, Stockholm, Sucre, Suva, Swansea, Swindon,
Sydney, T'bilisi, Taipei, Tallahassee, Tallinn, Tarawa, Tashkent, Tbilisi,
Tegucigalpa, Tehran, Thimphu, Tirana, Tirane, Tokyo, Toledo, Topeka, Torshavn,
Trenton, Tripoli, Tunis, Ulaanbaatar, Ulan Bator, Vaduz, Valletta, Vienna,
Vientiane, Vilnius, Virginia Beach, W. Indies, Warsaw, Washington DC,
Wellington, Wichita, Willemstad, Wilmington, Windhoek, Wolverhampton,
Yamoussoukro, Yangon, Yaounde, Yaren, Yerevan, Zagreb

### US Cities

Albany, Albuquerque, Anchorage, Annapolis, Atlanta, Augusta, Austin, Baltimore,
Baton Rouge, Billings, Birmingham, Bismarck, Boise, Boston, Bridgeport,
Buffalo, Burlington, Carson City, Charleston, Charlotte, Cheyenne, Chicago,
Cleveland, Columbia, Columbus, Concord, Dallas, Denver, Des Moines, Detroit,
Dover, Fargo, Frankfort, Harrisburg, Hartford, Helena, Honolulu, Houston,
Indianapolis, Jackson, Jacksonville, Jefferson City, Juneau, Kansas City,
Lansing, Las Vegas, Lincoln, Little Rock, Los Angeles, Louisville, Madison,
Manchester, Memphis, Miami, Milwaukee, Minneapolis, Montgomery, Montpelier,
Nashville, New Orleans, New York, Newark, Oklahoma City, Olympia, Omaha,
Orlando, Philadelphia, Phoenix, Pierre, Portland, Portland, Providence,
Raleigh, Richmond, Sacramento, Saint Paul, Salem, Salt Lake City, San Diego,
San Francisco, Santa Fe, Seattle, Sioux Falls, Springfield, Tallahassee,
Toledo, Topeka, Trenton, Virginia Beach, Wichita, Wilmington

## Thanks

The sun calculations in this module were adapted, for Python, from the
spreadsheets on the following page.

    | https://www.esrl.noaa.gov/gmd/grad/solcalc/calcdetails.html

Refraction calculation is taken from

    | Sun-Pointing Programs and Their Accuracy
    | John C. Zimmerman Of Sandia National Laboratones
    | https://www.osti.gov/servlets/purl/6377969

Which cites the following as the original source

    | In Solar Energy Vol 20 No.5-C
    | Robert Walraven Of The University Of California, Davis

The moon phase calculation is based on some javascript code
from Sky and Telescope magazine

    | Moon-phase calculation
    | Roger W. Sinnott, Sky & Telescope, June 16, 2006.
    | http://www.skyandtelescope.com/wp-content/observing-tools/moonphase/moon.html

Also to `Sphinx`_ for making doc generation an easy thing (not that the writing
of the docs is any easier.)

## Contact

Simon Kennedy <sffjunkie+code@gmail.com>
