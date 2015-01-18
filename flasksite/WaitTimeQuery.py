'''
This is an implementation that doesn't use
the kd-tree data structure. slow! 2.5 sec per query

'''
from __future__ import print_function, division

## global imports
import pandas as pd
import os, time
from geopy.distance import vincenty
import numpy as np
## local imports
from UtilGeo import distancelonlatlonlat

def identifier(w,h,q):
    '''
just get the identifier used for this data, for now simplify to hourly only
    '''
    return (h,)

class WaitTimeQuery:
    def __init__(self):
        ##load up
        self.whqdatad = {}
        for weekday in range(0,1):#7):
            for hour in range(0,24):
                for qhr in range(0,1):#4):
                    print("loading weekday,hour,q file", weekday, hour, qhr)
                    fp = open("/Users/groves-local/fastarea/dataendpointscorenp/out_hour%02d.txt.s.csv"%identifier(weekday,hour,qhr),'r')
                    #../dataendpointscore/out_hour%02d.txt.s.csv"%identifier(weekday,hour,qhr),'r')
                    #fp = open("../dataendpointscore/out_weekday%02d_hour%02d_q%d.txt"%(weekday,hour,qhr),'r')
                    df = pd.DataFrame.from_csv(fp)
                    df = df.reset_index()
                    self.whqdatad[identifier(weekday,hour,qhr)] = df
                    #print("dtypes:", df.dtypes)
                    #print("df",df.ix[0])
                    
        pass

    def query(self,lat,lng,epoch,k=5,maxdst=0.4):
        '''Query the data sources based on the lat, lng, and time (will
regularize to 15 minute intervals on rows identified by
weekday-hour-quarterhour). Returns a dictionary of the mean arrival
interval along with some other information based on the query location.  

        maxdst is in miles
        '''

        time_st = time.localtime(epoch)
        weekday = time_st.tm_wday
        hour = time_st.tm_hour
        qhr = int(time_st.tm_min/15)
        df = self.whqdatad[identifier(weekday,hour,qhr)]
        place = lng, lat
        dstfn = np.vectorize(lambda x,y: distancelonlatlonlat(place[0],place[1],x,y))
        dst = dstfn(df.lon,df.lat)
        relevantintersections = df[dst < maxdst]
        print("how many relevant:", len(relevantintersections))
        #print("relevant intersections:\n",relevantintersections)

        return relevantintersections
        
        pass

if __name__ == '__main__':

    wtqobj = WaitTimeQuery()

    a = (40.7553,-73.9747,1421097400)
    print("doing query:", a)
    print("result:", wtqobj.query(*a))
    
