'''

'''
from __future__ import print_function, division

## global imports
import pandas as pd
import os, time
from geopy.distance import vincenty
import numpy as np
## local imports
from UtilGeo import distancelonlatlonlat

#def main():
if __name__ == '__main__':
    placestotest = [
        (-73.7912791,40.6453754,'JFK'),
        (-73.8717742,40.7740414,'LGA'),
        (-73.9626106,40.7132247,'Williamsburg'),
        (-73.9862499,40.7522135,'Midtown'),
]
    
    timestart = time.time()


    place = placestotest[-1]
    
    
    docountarr = np.zeros((7,24,4),dtype=np.int32)
    pucountarr = np.zeros((7,24,4),dtype=np.int32)
    dstfn = np.vectorize(lambda x,y: distancelonlatlonlat(place[0],place[1],x,y))
    for weekday in range(0,7):#7):
        for hour in range(0,24):
            for qhr in range(0,4):#4):
                print("output weekday,hour,q file", weekday, hour, qhr)
                #fp = open("../dataendpointscore/out_hour%02d.txt"%(hour,),'r')
                fp = open("../dataendpointscore/out_weekday%02d_hour%02d_q%d.txt"%(weekday,hour,qhr),'r')
                df = pd.DataFrame.from_csv(fp)

                df = df.reset_index()
                #print("dtypes:", df.dtypes)
                #print("df",df.ix[0])

                dst = dstfn(df.lon,df.lat)
                relevantintersections = df[dst < 0.5]
                print("how many relevant:", len(relevantintersections))
                pucountarr[weekday,hour,qhr] = np.sum(relevantintersections['pickupcnt'])
                docountarr[weekday,hour,qhr] = np.sum(relevantintersections['dropoffcnt'])
                #fp.write("lon,lat,pickupcnt,dropoffcnt\n")
    
    print("happy")
    dots = np.sum(docountarr,axis=0).reshape((24*4,))
    puts = np.sum(pucountarr,axis=0).reshape((24*4,))
    timearr = np.arange(0,24,0.25)
    #import matplotlib.pyplot as plt
    
    

#if __name__ == '__main__':
#    main()
