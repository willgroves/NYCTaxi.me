'''Query 2: statistics for taxi-driver wait time (time between fares)

2015.01.20
'''
from __future__ import print_function, division

##update default type inference for numpy to float32
from numpy import float32, empty as _empty
def empty(*args, **kwargs):
    kwargs.update(dtype=float32)
    _empty(*args, **kwargs)

## global imports
import pandas as pd
import os, time, math
from geopy.distance import vincenty
import dill, copy
import numpy as np
## local imports
from UtilGeo import *

#def main():
if __name__ == '__main__':
    
    timestart = time.time()

    #pathtemplate = os.path.expanduser("~/wg/data/clean_%d_short.csv")
    pathtemplate = os.path.expanduser("~/wg/data/clean_%d_sorted.csv")
    #pathtemplate = os.path.expanduser("~/wg/data/clean_%d_sortedshort.csv")
    tmpl = []

    
    ##load a month into a df    
    #for monthidx in range(2,13):#13):
    def work(monthidx):
        driverstatsdf = pd.DataFrame()#pd.DataFrame(columns=['hKey','whqkey','dstmi','waitsec','lon','lat','llon','llat','ldst','ndst','lsecs','nsecs'])
        path = pathtemplate%monthidx
        print("loading file:", path, time.time()-timestart)
        fp = open(path,'rb')
        df = pd.read_table(fp,sep=',', index_col=False)
        header = copy.copy(df.columns.values.tolist())
        
        #print("loaded data frame, resetting index",time.time()-timestart)

        print("loading complete", len(df), time.time()-timestart)
        #df.sort('epoch',inplace=True)

        df['hkey'] = np.vectorize(lambda x: hash(x))(df['hack_license'])
        del df['hack_license']
        del df['medallion']
        del df['dropoffzone']
        del df['pickupzone']
        del df['vendor_id']
        
        ##iterate through all fare entries, keep track of last fare for each hack id as we go.
        hkeygb = df.groupby('hKey')

        for _i, hkeydf in hkeygb:
            tmpl = []
            lasttripempty = True
            if _i % 200 == 0:
                print ("starting new hkey:", _i, driverstatsdf.shape)
            for rowi, row in hkeydf.iterrows():
                #if rowi % 200 == 0: print("doing rowi", rowi, driverstatsdf.shape)
                #row = df.ix[rowi]
                hKey = row.hkey
                #hKey = hash(row.hack_license)%2e9#int(row.hKey)
                #print("seeing hkey:", hKey, row.epoch)
                if lasttripempty or not lasttrip.hkey == hKey:
                    lasttripempty = False
                    lasttrip = row
                    #print("saving hkey:", hKey, row.epoch)
                else:
                    ## a match
                    lastrow = lasttrip
                    #lastrow = df.ix[lastrowi]
                    epoch = int(row.epoch)
                    lastepochend = int(lastrow.epoch+lastrow.data__trip_time_in_secs)

                    waitsec = epoch-lastepochend
                    ##some waitsec periods are negative, possibly due to "adding time" on previous fare
                    #print("waitsec:", waitsec)
                    #if (waitsec < -120): 
                    #    1/0
                    if waitsec < 21600:#wait must be less than 6 hours
                        #print("adding",row)
                        lon = float(row.data__pickup_longitude)
                        lat = float(row.data__pickup_latitude)
                        llon = float(lastrow.data__dropoff_longitude)
                        llat = float(lastrow.data__dropoff_latitude)
                        dstmi = distancelonlatlonlat(lon,lat,llon,llat)
                        timestruct = time.localtime(epoch)
                        whqkey=(timestruct.tm_wday*4*24+timestruct.tm_hour*4+math.floor(timestruct.tm_min/15))          

                        tmpl.append({'epoch':epoch, 'hKey':hKey,
                                              'whqkey':whqkey,
                                              'dstmi':dstmi,
                                              'waitsec':waitsec,
                                              'lon':lon,
                                              'lat':lat,
                                              'llon':llon,
                                              'llat':llat,
                                              'ldst':lastrow.data__trip_distance,
                                              'ndst':row.data__trip_distance,
                                              'lsecs':lastrow.data__trip_time_in_secs,
                                              'nsecs': row.data__trip_time_in_secs,
                                              'lfare':lastrow.fare__total_amount,
                                     'nfare':row.fare__total_amount,})
                    lasttrip = row
            if len(tmpl) > 0:
                #driverstatsdf = pd.concat([driverstatsdf,pd.DataFrame(tmpl)])
                writemode = 'w'
                if _i > 0: writemode = 'a'
                with open(path+".wait.csv", writemode) as f:
                    pd.DataFrame(tmpl).to_csv(f, header=False if writemode == 'a' else True, index=False)
        #pathdill = path+".stat.dill"
        #dill.dump(driverstatsdf,open(pathdill,'w'))
    #import multiprocessing
    #pool = multiprocessing.Pool(2, maxtasksperchild=1)
    #pool.map(work,range(1,13))
    map(work,reversed(range(1,13)))
        
#if __name__ == '__main__':
#    main()
