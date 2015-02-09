'''
Geographical utilities

'''

from geopy.distance import vincenty

def distancelonlatlonlat(lon1,lat1,lon2,lat2):
    '''
returns great circle distance in miles
    '''
    rv = vincenty((lat1,lon1),(lat2,lon2)).miles
    #print "comparison and return:", (lat1,lon1),(lat2,lon2),rv
    return rv
