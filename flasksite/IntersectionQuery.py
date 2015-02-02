from __future__ import print_function, division


## global imports
import pandas as pd
import os, time, math, dill
import numpy as np
## local imports

def identifier(w,h,q):
    '''
just get the identifier used for this data, for now simplify to hourly only
    '''
    return (h,)

class IntersectionQuery:
    def __init__(self):
        ##load up
        self.loadedl = dill.load(open('../../datavariance/q4.dill','r'))

    def list(self,length=5):
        '''Query the data source

        '''
        tdf = self.loadedl[:length]
        resultl = tdf

        finall = []
        for i,r in enumerate(resultl):
            r['index'] = i
        resultl.sort(key=lambda x: 0.0-(x['mudo']+x['mupu']))
        for i, r in enumerate(resultl):
            ##do necessary text processing here
            result = {}
            result['index'] = r['index']
            result['rank'] = "<div class='rowgetter' id='rowgetter%d'>%d</div>"%(i+1,i+1)
            result['lat_txt'] = "%.4f"%r['lat']
            result['lon_txt'] = "%.4f"%r['lon']
            result['roadname'] = r['roadname']
            result['pph'] = "%.2f"%(4*1.5*30.0/(np.mean(r['puts']))) #the 3 is because k=3 in the data gathering step
            result['dph'] = "%.2f"%(4*1.5*30.0/(np.mean(r['dots'])))
            #result['dph'] = "%.3f %.3f"%(np.average(r['puts']),np.mean(r['puts']))
            result['doexcess'] = "%.1f"%(100.0*r['mudo']/(r['mudo']+r['mupu']))#"%.3f"%(100.0*(((r['mupu']-r['mudo']) * 4.0/365/7.0) +1.0) / 2.0)
            finall.append(result)
        return finall
    def query(self,idx):
        try:
            raw = -1#self.loadedl[idx]
            for i, r in enumerate(self.loadedl):
                if r['index'] == idx:
                    raw = r
                    break
            
            print("idx:",idx,"roadname:",raw['roadname'])
            ##convert this into a data provider with just the needed fields

            ##30.0/
            record = pd.DataFrame(np.concatenate([[raw['timearr']],[2.0*30.0/(raw['dots'])],[2.0*30.0/(raw['puts'])]]).T, columns=['time','dots','puts']).to_dict(orient='records')
            for r in record:
                r['dots'] = "%.3f"%r['dots']
                r['puts'] = "%.3f"%r['puts']
            print("Hello, record is:", record)
        except Exception as e:
            print("Error query exception occurred!", e)
            record = []
        return record
if __name__ == '__main__':

    intobj = IntersectionQuery()

    print("doing query:",)
    print("result:", intobj.list())
    a = intobj.list()
    
    print("a record:", intobj.query(0))
    print('keys:',intobj.query(0).keys())
    #{'index': 0, 'doexcess': '0.202', 'roadname': 'Esplanade', 'lon_txt': '-74.018', 'pph': '0.72', 'lat_txt': '40.712', 'dph': '0.52'}
