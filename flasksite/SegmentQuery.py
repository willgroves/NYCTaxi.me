from __future__ import print_function, division


## global imports
import pandas as pd
import os, time, math
import numpy as np
## local imports
from UtilGeo import distancelonlatlonlat, distancelonlatlonlatman
import scipy.spatial

def identifier(w,h,q):
    '''
just get the identifier used for this data, for now simplify to hourly only
    '''
    return (h,)

class SegmentQuery:
    def __init__(self):
        ##load up
        self.loadeddf = None
        self.loadedid = None
        pass

    def query(self,lat,lng,epoch,k=1,):
        '''Query the data sources based on the lat, lng, and time (will
regularize to 15 minute intervals on rows identified by
weekday-hour-quarterhour). Returns a dictionary of the mean arrival
interval along with some other information based on the query location.  

        maxdst is in miles
        '''
        print("epoch", epoch, type(epoch))
        #time.sleep(1)
        time_st = time.localtime(float(epoch))
        weekday = time_st.tm_wday
        hour = time_st.tm_hour
        qhr = int(time_st.tm_min/15)

        identifi = identifier(weekday,hour,qhr)
        if self.loadedid != identifi:
            ##do a load
            print("loading weekday,hour,q file", weekday, hour, qhr)
            fp = open("../../datasegment/out_hour%02d.csv"%identifi,'r')
            #../dataendpointscore/out_hour%02d.txt.s.csv"%identifier(weekday,hour,qhr),'r')
            #fp = open("../dataendpointscore/out_weekday%02d_hour%02d_q%d.txt"%(weekday,hour,qhr),'r')
            df = pd.DataFrame.from_csv(fp)
            df = df.reset_index()
            self.loadeddf = df
            self.loadedid = identifi
        else:
            print("already loaded!!")
            df = self.loadeddf
        
        place = float(lng), float(lat)

        model = scipy.spatial.cKDTree(np.array(df[['centroidlon_m1','centroidlat_m1']]))
        distancearr, choicearr = model.query(np.array([[lng, lat],]),k=k,)
        #dstfn = np.vectorize(lambda x,y: distancelonlatlonlat(place[0],place[1],x,y))
        #dst = dstfn(df.lon,df.lat)
        choicearr = choicearr[choicearr < len(df['centroidlon_m1'])]
        
        relinterl = df.loc[choicearr,:]
        resultl = relinterl.to_dict(orient='records')

        for i, result in enumerate(resultl):
            result['rank'] = i+1
            result['lat_txt'] = "%.3f"%result['centroidlat_m1']
            result['lon_txt'] = "%.3f"%result['centroidlon_m1']
            result['segment_name'] = mostFreq(map(lambda s: s.strip(),result['roadname_e1'].split('/')+result['roadname_e2'].split('/')))
            result['fatquery'] = '<a href="/ui?lon=%f&lat=%f&time=%02d:00&e=1&z=16">Run Query</a>'%(result['centroidlon_m1'],result['centroidlat_m1'],int(result['hour_m1']))
            if result['m2m1ratio']>1.0:
                result['heading_txt'] = "%.0f"%result['heading']
                result['direction'] = direction(result['end1lon_m1'],result['end1lat_m1'],result['end2lon_m2'],result['end2lat_m2'])            
                result['th_prefer'] = '%.2f'%(result['pickupcnt_m2']/365.0)
                result['th_preceeding'] = '%.2f'%(result['pickupcnt_m1']/365.0)
                result['m2m1ratio'] = '%.2f'%(result['m2m1ratio'])
            else:
                result['heading_txt'] = "%.0f"%result['heading']
                result['direction'] = direction(result['end1lon_m2'],result['end1lat_m2'],result['end2lon_m1'],result['end2lat_m1'])            
                result['th_prefer'] = '%.2f'%(result['pickupcnt_m1']/365.0)
                result['th_preceeding'] = '%.2f'%(result['pickupcnt_m2']/365.0)
                result['m2m1ratio'] = '%.2f'%(1.0/result['m2m1ratio'])
                
            return resultl

def direction(lon1,lat1,lon2,lat2):
    '''
given two locations, determine the bearing to go from 1 to 2. We return 
the result as a string with the general direction (e.g. NE 36 deg)
'''
    rv = ''
    print('lon1 lat1 lon2 lat2',lon1,lat1,lon2,lat2)
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

        rv += " %.0f degrees"% anglefromnorth
    else:
        rv += 'No Move'
    #print("result:", rv)
    return rv

        
def mostFreq(l):
    return max(set(l), key=l.count)

if __name__ == '__main__':

    segobj = SegmentQuery()

    a = (40.7553,-73.9747,1421097400)
    print("doing query:", a)
    print("result:", segobj.query(*a))
    
#result: [{'end2roadnamel_m2': "'NYE 47th St10003+NYLexington Ave+10003'", 'index_e1': 7906, 'centroidlat_m1': 40.754961, 'end1roadnamel_m2': "'NYE 47th St10003+NYPark Ave+10003'", 'dropoffcnt_m1': 5357, 'dropoffcnt_m2': 4733, 'm2m1ratio': 0.8502925877763329, 'weekday_m1': 0, 'weekday_m2': 0, 'lat_m2': 40.7546, 'lat_m1': 40.7553, 'end2id_m2': 72304, 'end1lat_m2': 40.75530300000001, 'end2lon_m2': -73.97373499999998, 'dst': 0.0017557178019380721, 'lon': -73.97454300000003, 'pickupcnt_m1': 6152, 'end1roadnamel_m1': "'NYE 47th St10003+NYPark Ave+10003'", 'end1lon_m2': -73.975352, 'end1lon_m1': -73.975352, 'qhr_m2': 0, 'qhr_m1': 0, 'rank': 1, 'roadname_prefer': 'E 47th St / Park Ave', 'lon_txt': '-73.975', 'roadname_inter_m1': "'NY_E 47th St_10003'", 'interid_m2': 72304, 'index_inter': 11092, 'end2roadnamel_m1': "'NYE 47th St10003+NYLexington Ave+10003'", 'index_e2': 8107, 'end2id_m1': 72304, 'interid_m1': 71942, 'roadname_inter_m2': "'NY_E 47th St_10003'", 'lat': 40.754961, 'roadname_e2': 'E 47th St / Lexington Ave', 'roadname_e1': 'E 47th St / Park Ave', 'hour_m1': 16, 'lon_m2': -73.9737, 'lon_m1': -73.9754, 'end2lat_m1': 40.754619, 'end2lon_m1': -73.97373499999998, 'centroidlon_m1': -73.97454300000003, 'hour_m2': 16, 'end2lat_m2': 40.754619, 'heading': 292.92863258997977, 'pickupcnt_m2': 5231, 'end1lat_m1': 40.75530300000001, 'id_m1': 16, 'id_m2': 16, 'centroidlon_m2': -73.97454300000003, 'centroidlat_m2': 40.754961, 'end1id_m1': 71942, 'end1id_m2': 71942, 'lat_txt': '40.755'}]

