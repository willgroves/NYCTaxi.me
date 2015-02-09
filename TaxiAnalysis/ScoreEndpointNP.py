'''
Compute the number of pickups and dropoffs at each intersection.

Uses multiprocessing POOL to parallelize computation.

Will Groves
2015.1.12

'''

import collections

defaultdict=collections.defaultdict
dd=defaultdict
import numpy as np

import csv
import time, math
import scipy.spatial
import numpy, glob, multiprocessing, copy, pickle, os
from pprint import pprint

DEBUG=1

CONST_ALL=0
CONST_HR=1
CONST_WK=2
CONST_WKHR=3

USEPOOL=True#False
POOLSIZE=8
FILEGLOB='../data/clean*_sorted.csv'

def loadEndpoints(fn):
    '''
loads endpoint data for roads in map area, also instantiates the 
    '''

    endpointl = []
    fp = open(fn,'r')
    header=fp.readline()
    line = fp.readline().rstrip("\n")
    idx=0
    while line != '':
        if len(line) < 5: 
            line = fp.readline().rstrip("\n")
            continue
        arr = line.split(',',2)
        if DEBUG>=3: print arr
        lon=float(arr[0])
        lat=float(arr[1])
        intersectionname=arr[2]
        endpointl.append([(lon,lat),intersectionname,
                      ])
        line = fp.readline().rstrip("\n")
        idx+=1
    
    return endpointl

class Result:
    def __init__(self):
        self.finalpuarr = None
        self.finaldoarr = None

    def log_result(self,unit):
        
        doarr = unit['do']
        puarr = unit['pu']
        print "got a call back result"
        print "pu assignments made:", np.sum(doarr,dtype=np.int32)
        print "do assignments made:", np.sum(puarr,dtype=np.int32)
        self.finaldoarr = self.finaldoarr+doarr
        self.finalpuarr = self.finalpuarr+puarr
        print "finished updating running totals"


def main():
    if not os.path.exists('statisticsnp.pickle'):
        ##load endpoints file
        endpointl=loadEndpoints("../dataendpoint/endpoint_withintersecting.csv")

        print "done loading endpoints!!"
        time.sleep(1)

        filel=glob.glob(FILEGLOB)
        print "file list:", filel
        endpointll = []
        eplen = len(endpointl)
        resultsobtained = 0
        #for unit in endpointll:
        finaldoarr = np.zeros((eplen,7,24,4),dtype=np.int16)
        finalpuarr = np.zeros((eplen,7,24,4),dtype=np.int16)
        
        resultobj = Result()
        resultobj.finaldoarr = finaldoarr
        resultobj.finalpuarr = finalpuarr


        if USEPOOL==False:
            tmpcopy = endpointl#copy.deepcopy(endpointl)
            for i, fn in enumerate(filel):
                result = (work((fn,tmpcopy)))
                resultobj.log_result(result)
        else:
            pool = multiprocessing.Pool(processes=POOLSIZE,maxtasksperchild=1)
            poolargl =[(fn,endpointl) for fn in filel]
            print "pool args:", pprint(poolargl,depth=2)
            for poolarg in poolargl:
                pool.apply_async(work,(poolarg,),callback=resultobj.log_result)
            print "waiting for pool to close!!"
            pool.close()
            pool.join()
            print "pool joined!"

    else:
        print "loading previously made statisticsnp.pickle"
        endpointl = pickle.load(open('statisticsnp.pickle','r'))

    finalpuarr = resultobj.finalpuarr
    finaldoarr = resultobj.finaldoarr


    print "writing output file"
    if not os.path.exists('../dataendpointscorenp'):
        os.makedirs('../dataendpointscorenp')
    fp = open("../dataendpointscorenp/out.txt",'w')
    fp.write("lon,lat,pickupcnt,dropoffcnt,roadname\n")
    arr = []
    for i,ep in enumerate(endpointl):
        arr.append("%0.4f,%0.4f,%d,%d,%s\n"%(ep[0][0],ep[0][1],finalpuarr[i,:,:,:].sum(dtype=np.int32),finaldoarr[i,:,:,:].sum(dtype=np.int32),ep[1]))
    fp.write("".join(arr))
    fp.close()

    print "doing fast hour files"
    for hour in range(0,24):
        print "output fast hour file", hour
        fp = open("../dataendpointscorenp/out_hour%02d.txt"%hour,'w')
        fp.write("lon,lat,pickupcnt,dropoffcnt,roadname\n")
        arr = []
        pul = finalpuarr[:,:,hour,:].sum(axis=2, dtype=np.int32).sum(axis=1)
        dol = finaldoarr[:,:,hour,:].sum(axis=2, dtype=np.int32).sum(axis=1)
        print "pusum:", pul.sum(), "dosum:", dol.sum()
        for i,ep in enumerate(endpointl):
            fp.write("%0.4f,%0.4f,%d,%d,%s\n"%(ep[0][0],ep[0][1],pul[i],dol[i],ep[1]))
        fp.close()
    
    for weekday in range(0,7):
        print "output weekday file", weekday
        fp = open("../dataendpointscorenp/out_weekday%02d.txt"%weekday,'w')
        fp.write("lon,lat,pickupcnt,dropoffcnt,roadname\n")
        arr = []
        pul = finalpuarr[:,weekday,:,:].sum(axis=2, dtype=np.int32).sum(axis=1)
        dol = finaldoarr[:,weekday,:,:].sum(axis=2, dtype=np.int32).sum(axis=1)
        print "pusum:", pul.sum(), "dosum:", dol.sum()
        for i,ep in enumerate(endpointl):
            fp.write("%0.4f,%0.4f,%d,%d,%s\n"%(ep[0][0],ep[0][1],pul[i],dol[i],ep[1]))
        fp.close()

    for weekday in range(0,7):
        for hour in range(0,24):
            for qhr in range(0,4):
                print "output weekday,hour,q file", weekday, hour, qhr
                fp = open("../dataendpointscorenp/out_weekday%02d_hour%02d_q%d.txt"%(weekday,hour,qhr),'w')
                fp.write("lon,lat,pickupcnt,dropoffcnt,roadname\n")
                arr = []
                pul = finalpuarr[:,weekday,hour,qhr]
                dol = finaldoarr[:,weekday,hour,qhr]
                print "pusum:", pul.sum(), "dosum:", dol.sum()        
                for i,ep in enumerate(endpointl):
                    fp.write("%0.4f,%0.4f,%d,%d,%s\n"%(ep[0][0],ep[0][1],pul[i],dol[i],ep[1]))
                fp.close()


def work(args):
    '''
loads a data file (e.g. clean_*.csv) and assigns the pickups and dropoff to the nearest endpoint

    '''
    (fn,endpointl) = args
    
    print "starting work on fn:",fn
    a = numpy.array([row[0] for row in endpointl])
    model = scipy.spatial.cKDTree(a,50)
    ##score endpoints by loading data files    
    print "reading lines"
    cnt = 0
    eplen=len(endpointl)
    ##instantiate np multidimensional array here
    doarr = np.zeros((eplen,7,24,4),dtype=np.int16)
    puarr = np.zeros((eplen,7,24,4),dtype=np.int16)
    

    if True:
        print "reading from file:", fn
        reader= csv.DictReader(open(fn,'r'))
        for row in reader:
            #print row
            myd, myi = model.query(numpy.array([[float(row['data__pickup_longitude']),float(row['data__pickup_latitude'])],
                                                [float(row['data__dropoff_longitude']),float(row['data__dropoff_latitude'])],]),k=2,distance_upper_bound=0.01)

            epoch = int(row['epoch'])
            timestruct = time.localtime(epoch)
            epochend = int(row['epoch'])+int(row['data__trip_time_in_secs'])
            timestructend = time.localtime(epochend)            
            
            for i in myi.tolist()[0][:1]:
                if i == eplen: continue
                iwhqkey=(i,timestruct.tm_wday,timestruct.tm_hour,math.floor(timestruct.tm_min/15))
                puarr[iwhqkey]+=1
            #print "myd, myi", myd, myi

            for i in myi.tolist()[1][:1]:
                if i == eplen: continue
                iwhqkeyend=(i,timestructend.tm_wday,timestructend.tm_hour,math.floor(timestructend.tm_min/15))
                doarr[iwhqkeyend]+=1
            #print "myd, myi", myd, myi
            if cnt % 100000 == 0 and cnt>0: 
                print "processed cnt", cnt
            cnt+=1
    print "pu assignments made:", np.sum(puarr,axis=None,dtype=np.int32)
    print "do assignments made:", np.sum(doarr,axis=None,dtype=np.int32)
    return {'pu':puarr, 'do':doarr}
if __name__ == '__main__':
    main()
