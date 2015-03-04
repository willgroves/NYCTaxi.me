
20150303

Running ui as stand-alone demo (no tileserver, just python):

1. Make sure that the map tiles are expanded already. Look in
flasksite/static/tiles/, there should be some directories there. If
not, then run the ./decompress.sh file in that directory to expand the
map files.

2. Execuse the server in flasksite/ using 'python run.py'

3. Should be visible at http://localhost:5001/

Python Library Requirements:
dill
geopy
tornado
numpy
scipy
...?

