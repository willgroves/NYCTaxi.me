'''
Geographical utilities

'''

from geopy.distance import vincenty

import math

def distancelonlatlonlat(lon1,lat1,lon2,lat2):
    '''
returns great circle distance in miles
    '''
    rv = vincenty((lat1,lon1),(lat2,lon2)).miles
    #print "comparison and return:", (lat1,lon1),(lat2,lon2),rv
    return rv


londstmi = distancelonlatlonlat(-73,40,-72,40)
latdstmi = distancelonlatlonlat(-73,40,-73,41)
#print('londstmi',londstmi)
#print('latdstmi',latdstmi)

dir1x, dir1y = 11.0, 13.0
dir1xfixed, dir1yfixed = londstmi*dir1x, latdstmi*dir1y
dir1xnorm, dir1ynorm = dir1xfixed/math.sqrt(dir1xfixed*dir1xfixed+dir1yfixed*dir1yfixed), dir1xfixed/math.sqrt(dir1xfixed*dir1xfixed+dir1yfixed*dir1yfixed)
dir2xfixed, dir2yfixed = 1, -1.0*dir1xfixed/dir1yfixed
dir2xnorm, dir2ynorm = dir2xfixed/math.sqrt(dir2xfixed*dir2xfixed+dir2yfixed*dir2yfixed), dir2yfixed/math.sqrt(dir2xfixed*dir2xfixed+dir2yfixed*dir2yfixed)

#print('dir1xnorm, dir1ynorm',dir1xnorm, dir1ynorm)
#print('dir2xnorm, dir2ynorm',dir2xnorm, dir2ynorm)

def londisplatdisptomanhattandst(londisp,latdisp):
    eastmi = abs(londisp)*londstmi
    northmi = abs(latdisp)*latdstmi
    manhatnorthmi = dir1xnorm*eastmi+dir1ynorm*northmi
    print "manhattan north mi", manhatnorthmi
    manhateastmi = dir2xnorm*eastmi+dir2ynorm*northmi
    print "manhattan east mi", manhateastmi
    return abs(manhatnorthmi)+abs(manhateastmi)

def distancelonlatlonlatman(lon1,lat1,lon2,lat2):
    '''corrected version of manhattan distance that projects the data in
the directions of the manhattan grid before estimating distance
    '''
    return londisplatdisptomanhattandst(abs(lon2-lon1), abs(lat2-lat1))

    

if __name__ == '__main__':
    x1,y1 = -73.9851,40.7511
    x2,y2 = -73.9824,40.7515
    londelta = x2-x1
    latdelta = y2-y1

    print('exampledst:',distancelonlatlonlat(x1,y1,x2,y2))
    print('manhatexampledst:',londisplatdisptomanhattandst(x2-x1,y2-y1))
        
    
    x1,y1 = -73.9879,40.7564 
    x2,y2 = -73.9878,40.7498
    londelta = x2-x1
    latdelta = y2-y1

    print('exampledst:',distancelonlatlonlat(x1,y1,x2,y2))
    print('manhatexampledst:',londisplatdisptomanhattandst(x2-x1,y2-y1))
    
