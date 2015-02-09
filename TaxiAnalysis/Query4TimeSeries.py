'''

'''
from __future__ import print_function, division

## global imports
import pandas as pd
import os, time
from geopy.distance import vincenty
import numpy as np
import scipy.spatial
## local imports
from UtilGeo import distancelonlatlonlat

    
def getTSatLocation(place,datad,modeld,rowi,mincount=None):
    '''
    place is like: (-73.9862499,40.7522135,'Midtown')
    '''
    dstfn = np.vectorize(lambda x,y: distancelonlatlonlat(place[0],place[1],x,y))
    distances, choices = model.query(np.array([place[0],place[1]]),k=3,) #
    pucountarr = pu[choices,:,:,:].mean(axis=0)
    docountarr = do[choices,:,:,:].mean(axis=0)
    #pucountarr = pucountarr.mean(axis=0)
    #docountarr = docountarr.mean(axis=0)
    if mincount != None and np.average(pucountarr,None) < mincount:
        return None
    #print("happy")
    dots = np.mean(docountarr,axis=0).reshape((24*4,))
    puts = np.mean(pucountarr,axis=0).reshape((24*4,))
    diffs = dots-puts
    timearr = np.arange(0,24,0.25)
    #import matplotlib.pyplot as plt
    maxdiff = np.max(diffs,axis=None)
    mindiff = np.min(diffs,axis=None)
    mudiff = np.average(diffs,axis=None)
    record = {'lon':place[0],'lat':place[1],'roadname':place[2],
              'timearr':timearr,
              'dots':dots,
              'puts':puts, 'diffs': diffs, 'maxdiff': maxdiff*4.0, 'mindiff':mindiff*4.0, 'mudiff':mudiff*4.0,'sddiff':np.std(diffs)*4.0,
              'mupu':np.average(puts)*4.0,'mudo':np.average(dots)*4.0   }
    return record
def formatInterName(roadname):
    arr = roadname.split('|')
    arr.sort(key=lambda x: -len(x))
    name = arr[0].replace('10003',' / ').replace('10002',' / ').replace('10001',' / ').replace('+','').replace('NY','').replace('NJ','').replace('  ',' ').replace("'","")
    fname = name.rstrip(' ').rstrip('/').rstrip(' ')
    return fname

    
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
    
    with open("../dataendpoint/endpoint_withintersecting.csv",'r') as fp:
        interdf = pd.DataFrame.from_csv(fp,index_col=False)
        interdf = interdf.reset_index()
        import numpy as np
        fin = np.vectorize(formatInterName)        
        interdf['roadnamel'] = fin(interdf['roadnamel'])
        model = scipy.spatial.cKDTree(np.array(interdf[['lon','lat']]),50)

    pu = np.ones((len(interdf),7,24,4))-0
    do = np.ones((len(interdf),7,24,4))-0
    for weekday in range(0,7):#7):
        for hour in range(0,24):
            for qhr in range(0,4):#4):
                print("input weekday,hour,q file", weekday, hour, qhr)
                #fp = open("../dataendpointscorenp/out_hour%02d.txt.s.csv"%(hour,),'rb')
                fp = open("../dataendpointscorenp/out_weekday%02d_hour%02d_q%d.txt.s.csv"%(weekday,hour,qhr),'rb')
                df = pd.DataFrame.from_csv(fp)
                df = df.reset_index()
                #datad[(weekday,hour,qhr)] = df
                #model = scipy.spatial.cKDTree(np.array(df[['lon','lat']]))
#               modeld[(weekday,hour,qhr)] = model.query(np.array([[lng, lat],]),k=5,) #
                distances, choices = model.query(np.array([df['lon'],df['lat']]).T,k=1,) #
                do[choices,weekday,hour,qhr] = df['dropoffcnt']
                pu[choices,weekday,hour,qhr] = df['pickupcnt']
                
                #print("dtypes:", df.dtypes)
                #print("df",df.ix[0])

    print("loading endpoint pudo counts complete! now doing time series.")
    #1/0
    
    import dill
    recordl = []
    for rowi,record in enumerate(interdf.to_dict(orient='records')):
        place = (record['lon'],record['lat'],record['roadnamel'])
        print("doing place:", place)
        resultts = getTSatLocation(place,model,pu,do,0.3*365/4.0)
        if resultts == None:
            print("skipped!")
            continue
            
        recordl.append(resultts)
    print("finished loading events")
    fp = open('q4.dill','w')
    dill.dump(recordl,fp)
    fp.close()
    for i,r in enumerate(recordl):
        r['index'] = i
    b = pd.DataFrame(recordl)
    b['doexcess'] = (b['mudo']-b['mupu'])/(b['mudo']+b['mupu'])
    b[['index','lon','lat','maxdiff','mindiff','mudiff','sddiff','mudo','mupu','doexcess','roadname',]].to_csv('q4.csv',index=False, float_format='%0.6f')
#if __name__ == '__main__':
#    main()

