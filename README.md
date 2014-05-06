MUGradeDist
===========

This program displays the results of the Miami University Grade Distribution. The data for the program is stored in a sqlite database stored in the "db/" folder.


Install
==========
The program needs the following modules installed:
-php5-sqlite
-php5-json

To generate/update the program run the [Python Code](https://github.com/harmonbc/GrdistParser) agasint a folder containing all of the csv's.

Update
==========
When adding a new year, upload the folder and change [these js/script.js lines](https://github.com/harmonbc/MUGradeDist/blob/master/js/script.js#L82) to reflect the years that can be searched.
