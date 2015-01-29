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
        for i, r in enumerate(resultl):
            ##do necessary text processing here
            result = {}
            result['index'] = i
            result['lat_txt'] = "%.4f"%r['lat']
            result['lon_txt'] = "%.4f"%r['lon']
            result['roadname'] = r['roadname']
            result['pph'] = "%.2f"%(r['mupu']*4.0/365/7.0)
            result['dph'] = "%.2f"%(r['mudo']*4.0/365/7.0)
            result['doexcess'] = "%.3f"%((r['mupu']-r['mudo']) * 4.0/365/7.0)
            finall.append(result)
        return finall
    def query(self,idx):
        try:
            record = self.loadedl[idx]
        except Exception as e:
            print("Error query exception occurred!", e)
            record = {}
        return record
if __name__ == '__main__':

    intobj = IntersectionQuery()

    print("doing query:",)
    print("result:", intobj.list())
    a = intobj.list()
    
    print("a record:", intobj.query(0))
    print('keys:',intobj.query(0).keys())
    #{'index': 0, 'doexcess': '0.202', 'roadname': 'Esplanade', 'lon_txt': '-74.018', 'pph': '0.72', 'lat_txt': '40.712', 'dph': '0.52'}
