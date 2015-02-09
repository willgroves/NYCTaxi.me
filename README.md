# NYCTaxi.me 

* Interactive web frontend and data analysis package for 2013 New York
  City yellow taxi data

## Overview

How many of you have ever had this problem: You are standing in the
middle of a block somewhere in NYC. There are no taxis. You look left,
you look right, the block is long. Maybe there is a taxi at the next
intersection... maybe not. How can you know? This project, NYCTaxi.me,
seeks to answer this question. By analyzing taxi fare patterns, we can
predict likelihood of finding a taxi at several intersections nearest
to your location. In this project, using a large corpus of taxi fare
data released by the Taxi and Livery Commission including all yellow
cab fares for 2013 (160 million fares in total). This data is
statistically analyzed using machine learning to predict the average
expected wait time at the intersections nearest to you based on the
time of day (15-minute resolution) and day of the week.

## Frontend Component

NYCTaxi.me deployment requires:

1. a webserver and
2. a map tile server component -- for UI display of maps with Leaflet

What is neeeded to deploy?

1. run webserver in TaxiFrontend/ from run.py
  * It is expected that there are data files in 
    * dataendpointscorenp/out_hour??.txt.s.csv
    * datasegment/out_hour??.csv 
    * datavariance/q4.dill q4.csv
2. run tile server with configuration tilestache.cfg with TileStache MBTiles server

## Data Analysis Component

* Tools used to generate data used in frontend.

* Assume that the taxi data is available and preprocessed using the
  information in the Data Sources section. The data files should
  be of the form: clean_??.csv . One file for each month (1-12).

* The data files are not exactly sorted in time order, so it is
  useful to sort them by timestamp. Use getsorted.sh to generate 
  clean_??_sorted.csv.

* To generate:  dataendpointscorenp/out_hour??.txt.s.csv
  * Use: TaxiAnalsyis -- ScoreEndpointNP.py

* To generate:  datasegment/out_hour??.csv 
  * Use: TaxiAnalysis -- Query3SegmentGradient.py

* To generate:  datavariance/q4.dill q4.csv
  * Use: TaxiAnalysis -- Query4TimeSeries.py

## Data Sources 

* Taxi data from: http://chriswhong.com/open-data/foil_nyc_taxi/
* Data preprocessing steps (join fare and trip data) from: https://github.com/tswanson/TaxiNYC2013 
