'''
Walking Direction Query -- for nyctaxi.me find-a-taxi

Will Groves

2015.1.14
'''
from __future__ import print_function, division


## global imports
import pandas as pd
import os, time, math
from geopy.distance import vincenty
import numpy as np
## local imports
from UtilGeo import distancelonlatlonlat, distancelonlatlonlatman
import scipy.spatial

def identifier(w,h,q):
    '''
just get the identifier used for this data, for now simplify to hourly only
    '''
    return (w,h,q,)
    #return (h,)

class WaitTimeQuery:
    def __init__(self):
        ##preload all data for queries
        self.whqdatad = {}
        for weekday in range(0,1):#7):
            for hour in range(0,24):
                for qhr in range(0,4):#4):
                    print("loading weekday,hour,q file", weekday, hour, qhr)
                    fp = open("../dataendpointscorenp/out_weekday%02d_hour%02d_q%d.txt.s.csv"%(weekday,hour,qhr),'r')
                    df = pd.DataFrame.from_csv(fp)
                    df = df.reset_index()
                    df['pickupcnt'] = 28*df['pickupcnt']
                    df['dropoffcnt'] = 28*df['dropoffcnt']
                    self.whqdatad[identifier(weekday,hour,qhr)] = df
        print("finished loading wait time query data!")
        pass

    def query(self,lat,lng,epoch,k=7,maxdst=0.5):
        '''Query the data sources based on the lat, lng, and time (will
regularize to 15 minute intervals on rows identified by
weekday-hour-quarterhour). Returns a dictionary of the mean arrival
interval along with some other information based on the query location.  

        maxdst is in miles
        '''
        print("epoch", epoch, type(epoch))
        time_st = time.localtime(float(epoch))
        weekday = time_st.tm_wday
        hour = time_st.tm_hour
        qhr = int(time_st.tm_min/15)
        df = self.whqdatad[identifier(weekday,hour,qhr)]
        place = float(lng), float(lat)

        model = scipy.spatial.cKDTree(np.array(df[['lon','lat']]))
        distancearr, choicearr = model.query(np.array([[lng, lat],]),k=k*15,)
        choicearr = choicearr[choicearr < len(df['lon'])]        
        relinterl = df.loc[choicearr,:]

        #print("how many relevant:", len(relinterl))
        #print("relevant intersections:\n",relinterl)
        dstfn = np.vectorize(lambda x,y: distancelonlatlonlat(place[0],place[1],x,y))
        dstfn = np.vectorize(lambda x,y: distancelonlatlonlatman(place[0],place[1],x,y))
        relinterl['dst_mi'] = dstfn(relinterl.lon,
                                                relinterl.lat)

        latlngfn = np.vectorize(lambda x,y: [x,y])
        relinterl['pu_wait'] = np.vectorize(lambda x: cntToWait(x,))(relinterl.pickupcnt)
        relinterl['do_wait'] = np.vectorize(lambda x: cntToWait(x,))(relinterl.dropoffcnt)
        relinterl['do_pu_ratio'] = 1.0*relinterl['do_wait']/relinterl['pu_wait']
        relinterl['intersection_name'] = np.vectorize(lambda x: formatInterName(x))(relinterl['roadname'])

        ##estimate walking time
        relinterl['walkmins'] = relinterl['dst_mi']/0.05#0.066 #assume 20 mins per mile
        resultl = relinterl.to_dict(orient='records')

        grp1min = [r for r in resultl if r['walkmins']>=0.0]

        ##sensible version, sort by expected wait time and amount of time walking
        grp1min.sort(key=lambda x: x['pu_wait']+x['walkmins'])

        resultl = grp1min
        resultl = resultl[:k]
        for i, result in enumerate(resultl):
            result['rank'] = i+1
            result['total'] = "<div class='rowgetter' id='rowgetter%d'>%.2f</div>"%(i+1,result['pu_wait']+result['walkmins'])
            result['dst_mi'] = "%.3f"%result['dst_mi']
            result['dst_walk'] = "%s %.2f"%(glyph(result['walkmins']),result['walkmins'])
            result['lat_txt'] = "%.4f"%result['lat']
            result['lon_txt'] = "%.4f"%result['lon']
            result['lat_txt_start'] = "%.4f"%place[1]
            result['lon_txt_start'] = "%.4f"%place[0]
            result['pu_wait'] = "%.2f"%result['pu_wait']
            result['do_pu_ratio'] = "%.2f"%result['do_pu_ratio']
            result['direction'] = direction(place[0],place[1],result['lon'],result['lat'])
            print('lon1 %0.4f lat1 %0.4f lon2 %0.4f lat2 %0.4f '%(place[0],place[1],result['lon'],result['lat']),end='')
            print(' dst_walk',result['dst_walk'],end='')
            print(' dst_mi',result['dst_mi'],end='')
            print(' total',result['total'],)


        return resultl

def glyph(dstwalk):
    '''
using font-awesome icons, show correct icon based on estimated
walking distance
    '''
    if dstwalk < 2.0: return '<i class="fa fa-anchor fa-lg"></i>'
    if dstwalk < 5.0: return '<i class="fa fa-male fa-lg"></i>'
    return '<i class="fa fa-bicycle fa-lg"></i>'    
    
def direction(lon1,lat1,lon2,lat2):
    '''
given two locations, determine the bearing to go from 1 to 2. We return 
the result as a string with the general direction (e.g. NE 36 deg)
'''
    rv = ''
    #print('lon1 lat1 lon2 lat2',lon1,lat1,lon2,lat2)
    londisp = float(lon2)-float(lon1)
    latdisp = float(lat2)-float(lat1)
    #print("londisp, latdisp", londisp, latdisp)
    if latdisp != 0.0 or londisp != 0.0:
        if londisp == 0.0:
            if latdisp > 0.0: angle = 90
            else: angle = -90
        else:
            angle = 180.0/3.14152950*np.arctan(1.0*latdisp/londisp)
        if londisp < 0.0: angle += 180
        #print('orig angle:',angle)    
        anglefromnorth = int(90-angle)%360
        if anglefromnorth < 45.0/2: rv += 'N'
        elif anglefromnorth < 45.0/2+45: rv += 'NE'
        elif anglefromnorth < 45.0/2+2*45: rv += 'E'
        elif anglefromnorth < 45.0/2+3*45: rv += 'SE'
        elif anglefromnorth < 45.0/2+4*45: rv += 'S'
        elif anglefromnorth < 45.0/2+5*45: rv += 'SW'
        elif anglefromnorth < 45.0/2+6*45: rv += 'W'
        elif anglefromnorth < 45.0/2+7*45: rv += 'NW'
        else: rv += 'N'
        #rv += " %.0f deg"% anglefromnorth
    else:
        rv += 'No Move'
    #print("result:", rv)
    return rv
    
def formatInterName(roadname):
    arr = roadname.split('|')
    arr.sort(key=lambda x: -len(x))
    name = arr[0].replace('10003',' / ').replace('10002',' / ').replace('10001',' / ').replace('+','').replace('NY','').replace('NJ','').replace('  ',' ').replace("'","")
    fname = name.rstrip(' ').rstrip('/').rstrip(' ')
    return fname

    
def cntToWait(cnt):
    '''
    expected wait in minutes from the number of taxi arrivals per hour:
    60/(yearlycnt/365)/2 -- the 2 is because the average wait time is 1/2 of the
    average arrival interval.
    '''
    if cnt == 0:
        return 8*60
    return min(8*60,60/(2*1.0*cnt/365))


if __name__ == '__main__':

    wtqobj = WaitTimeQuery()

    a = (40.7553,-73.9747,1421097400)
    print("doing query:", a)
    print("result:", wtqobj.query(*a))
    
