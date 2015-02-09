

import pandas as pd
import numpy as np

with open("../dataendpoint/segments.csv",'r') as fp:
    segdf = pd.DataFrame.from_csv(fp,index_col=False)
    segdf = segdf.reset_index()

def bbfilter(df,coll=['lon','lat']):
    ##fn = np.vectorize(lambda lon,lat: (-74.003 < lon and  40.759 < lat and lon < -73.945 and lat < 40.773))
    ##return df[fn(*[df[c] for c in coll])]
    return df 

segdfsm = bbfilter(segdf,['centroidlon','centroidlat'])

print('subset len',len(segdfsm))
print('orig len',len(segdf))
#Load all relevant data from each 1 hour chunk.
#this code is from WaitTimeQueryKDTree.py
def identifier(w,h,q):
    '''
just get the identifier used for this data, for now simplify to hourly only
    '''
    return h#(w*24*4+h*4+q)

import os
import scipy.spatial

def work(fulldf,outputpath):
    with open("../dataendpoint/endpoint_withintersecting.csv",'r') as fp:
        interdf = pd.DataFrame.from_csv(fp,index_col=None)
        interdf = interdf.reset_index()


    intermodel = scipy.spatial.cKDTree(np.array(interdf[['lon','lat']]))

    distancearr, choicearr = intermodel.query(np.array(fulldf[['lon','lat']]),k=1,)

    print 'farthest match dst: ', np.max(distancearr)*100*1000 ##farthest match is only ~7 meters off

    print "### Matching segment ends to intersection locations ###"
    print "## Below shows the match frequency count histograms for end1 and end2"
    distancearr, choicearr = intermodel.query(np.array(segdf[['end1lon','end1lat']]),k=1,)
    segdf['end1id'] = choicearr
    print sum(pd.Series(choicearr).value_counts()>1)
    print np.histogram(pd.Series(choicearr).value_counts(),[a-0.5 for a in range(10)])
    distancearr, choicearr = intermodel.query(np.array(segdf[['end2lon','end2lat']]),k=1,)
    segdf['end2id'] = choicearr
    print np.histogram(pd.Series(choicearr).value_counts(),[a-0.5 for a in range(10)])
    print "segdf cols:", segdf.columns.values
    bbsegdf = bbfilter(segdf,['centroidlon','centroidlat'])

    bigldf = bbfilter(fulldf)
    distancearr, choicearr = intermodel.query(np.array(bigldf[['lon','lat']]),k=1,)
    bigldf['interid'] = choicearr

    print sum(pd.Series(choicearr).value_counts()>1)
    print np.histogram(pd.Series(choicearr).value_counts(),[a-0.5 for a in range(10)])

    bbt = pd.merge(bigldf,bbsegdf,left_on='interid',right_on='end1id',how='inner',suffixes=('_e1','_inter'))

    bigldf2 = bbfilter(fulldf)
    distancearr, choicearr = intermodel.query(np.array(bigldf2[['lon','lat']]),k=1,)
    bigldf2['interid'] = choicearr

    print sum(pd.Series(choicearr).value_counts()>1)
    print np.histogram(pd.Series(choicearr).value_counts(),[a-0.5 for a in range(10)])
    bbt2 = pd.merge(bigldf2,bbsegdf,left_on='interid',right_on='end2id',how='inner',suffixes=('_e2','_inter'))

    bbtm = pd.merge(bbt,bbt2,left_on='index_inter',right_on='index_inter',suffixes=('_m1','_m2'),how ='inner')

    print "bbtm columns:", bbtm.columns.values

    print "bbtm:", len(bbtm)

    print "### compute additional columns useful for display###"
    r = bbtm
    dst = np.sqrt(0.0+np.power(r['end2lon_m2']-r['end1lon_m1'],2)+np.power(r['end2lat_m2']-r['end1lat_m1'],2))
    r['dst'] = dst
    ## gradient direction
    r['heading'] = (180 * (r['pickupcnt_m1'] > r['pickupcnt_m2']) +180/np.pi*np.arctan2(1.0*(r['end2lon_m2']-r['end1lon_m1'])/r['dst'],1.0*(r['end2lat_m2']-r['end1lat_m1'])/r['dst']))%360
    r['m2m1ratio'] = 1.0 * r['pickupcnt_m2'] / r['pickupcnt_m1'] ## can look at direction of gradient from > 1.0 or < 1.0
    r['lon'] = r['centroidlon_m1']
    r['lat'] = r['centroidlat_m1']
    ## compute human readable names for endpoints
    fin = np.vectorize(formatInterName)
    r['roadname_e1'] = fin(r['roadname_e1'])
    r['roadname_e2'] = fin(r['roadname_e2'])
    ifthenelse = np.vectorize(lambda x,y,z: y if x else z)
    r['roadname_prefer'] = ifthenelse(r['m2m1ratio']>=1.0,r['roadname_e2'],r['roadname_e1']) 
    print "###okay store this file now ###"
    bbtm.to_csv(outputpath,index=False)

def formatInterName(roadname):
    arr = roadname.split('|')
    arr.sort(key=lambda x: -len(x))
    name = arr[0].replace('10003',' / ').replace('10002',' / ').replace('10001',' / ').replace('+','').replace('NY','').replace('NJ','').replace('  ',' ').replace("'","")
    fname = name.rstrip(' ').rstrip('/').rstrip(' ')
    return fname


if __name__ == '__main__':
    if not os.path.exists('../datasegment/'):
        os.makedirs('../datasegment/')

    for weekday in range(0,1):#7):
        for hour in range(0,24):#24
            for qhr in range(0,1):#4):
                fulldf = pd.DataFrame()
                fulldata = []
                print("loading weekday,hour,q file", weekday, hour, qhr, fulldf.shape)
                fp = open("../dataendpointscorenp/out_hour%02d.txt.s.csv"%identifier(weekday,hour,qhr),'r')
                outputpath = "../datasegment/out_hour%02d.csv"%identifier(weekday,hour,qhr)
                #../dataendpointscore/out_hour%02d.txt.s.csv"%identifier(weekday,hour,qhr),'r')
                #fp = open("../dataendpointscore/out_weekday%02d_hour%02d_q%d.txt"%(weekday,hour,qhr),'r')
                df = pd.DataFrame.from_csv(fp)
                df = df.reset_index()
                df = df.reset_index()
                print(df.columns)
                df['id'] = identifier(weekday,hour,qhr)
                df['weekday'] = weekday
                df['hour'] = hour
                df['qhr'] = qhr
                df.set_index(['index','id'])
                df = df[df['pickupcnt']>0]
                fulldata.append(df)

                fulldf = pd.concat(fulldata)
                work(fulldf, outputpath)
