'''
Go Taxi

Will Groves 2015.1.12

'''
from flask import Flask, flash, redirect, render_template, \
     request, url_for
import flask, os, time


#local imports
from WaitTimeQueryKDTree import WaitTimeQuery
from SegmentQuery import SegmentQuery
from IntersectionQuery import IntersectionQuery
import localconfig

def getNearestDataHour2Digit(hour):
    '''
determines which hour to request based on the data we have
    '''
    closest = hour%24
    availhourl = list(range(0,24))#[0,1,3,7,8,10,12,13,14,15,16,17,18,19,20,21,22,23]
    dsthourtupl = zip([abs(closest-h) for h in availhourl],availhourl)
    dsthourtupl.sort()
    return "%02d"%dsthourtupl[0][1]
    
wtqobj = WaitTimeQuery()
segobj = SegmentQuery()
interobj = IntersectionQuery()

app = Flask(__name__,
            instance_path=os.path.abspath('configs'),
            instance_relative_config=True,
            template_folder='templates',
            static_folder='static',
            static_url_path='/static')
app.secret_key = 'some_secret'

@app.route('/robots.txt')
def robots():
    response = flask.make_response("""User-agent: *\nDisallow: /\n""")
    response.headers["Content-type"] = "text/plain"
    return response

@app.route('/', methods=['GET',])
def table():
    return redirect('/static/splash/index.html')#url_for('static/splash/', filename='index.html'))

@app.route('/unset', methods=['GET', 'POST'])
def unset():
    cookieval = request.cookies.get('alreadyvisited',None)
    resp = flask.make_response("Unsetting your already visited cookie. Its value: %s %s"%(str(type(cookieval)),str(cookieval)))
    resp.set_cookie('alreadyvisited',expires=0)
    return resp

@app.route('/ui', methods=['GET', 'POST'])
def ui():
    cookieval = request.cookies.get('alreadyvisited','')
    app.logger.debug("value of the cookie:"+str(cookieval))
    addscript = ''
    if 'yes' not in cookieval: #if the cookie is not set
        addscript = "setTimeout(showInstructions,5000);"
    app.logger.debug("addscript string:"+addscript)
    resp = flask.make_response(render_template('ui.html',servername=localconfig.servername,mapserverport=localconfig.mapserverport,addscript=addscript))
    resp.set_cookie('alreadyvisited', 'yes')
    return resp

@app.route('/uifirst', methods=['GET', 'POST'])
def uifirst():
    addscript = "setTimeout(showInstructions,5000);"
    resp = flask.make_response(render_template('ui.html',servername=localconfig.servername,mapserverport=localconfig.mapserverport,addscript=addscript))
    return resp

@app.route('/ui.js', methods=['GET', 'POST'])
def uijs():
    error = None
    resp = flask.make_response(render_template('ui.js',servername=localconfig.servername,mapserverport=localconfig.mapserverport),
                               )
    resp.mimetype='application/javascript'
    return resp


@app.route('/segment', methods=['GET', 'POST'])
def segment():
    cookieval = request.cookies.get('alreadyvisited','')
    app.logger.debug("value of the cookie:"+str(cookieval))
    addscript = ''
    app.logger.debug("addscript string:"+addscript)
    resp = flask.make_response(render_template('segment.html',servername=localconfig.servername,mapserverport=localconfig.mapserverport,addscript=addscript))
    return resp


@app.route('/segment.js', methods=['GET', 'POST'])
def segmentjs():
    error = None
    resp = flask.make_response(render_template('segment.js',servername=localconfig.servername,mapserverport=localconfig.mapserverport),
                               )
    resp.mimetype='application/javascript'
    return resp


@app.route('/intersection', methods=['GET', 'POST'])
def intersection():
    cookieval = request.cookies.get('alreadyvisited','')
    app.logger.debug("value of the cookie:"+str(cookieval))
    addscript = ''
    app.logger.debug("addscript string:"+addscript)
    resp = flask.make_response(render_template('intersection.html',servername=localconfig.servername,mapserverport=localconfig.mapserverport,addscript=addscript))
    return resp


@app.route('/intersection.js', methods=['GET', 'POST'])
def intersectionjs():
    error = None
    resp = flask.make_response(render_template('intersection.js',servername=localconfig.servername,mapserverport=localconfig.mapserverport),
                               )
    resp.mimetype='application/javascript'
    return resp


@app.route('/suggestapi', methods=['GET'])
def suggestapi():
    app.logger.debug("request contents"+str(request))
    #app.logger.debug("dir request"+str(dir(request)))
    app.logger.debug("get args"+str(request.args))
    lat = request.args.get('lat',40.33)
    lng = request.args.get('lng',-78.8888)
    epoch = request.args.get('time',0)
    time_st = time.localtime(float(epoch))
    weekday = time_st.tm_wday
    hour = time_st.tm_hour
    datahour = getNearestDataHour2Digit(hour)
    npl = wtqobj.query(lat, lng, epoch)
    f = {'nearestplaces': npl,
         'query': {'time':epoch,'latlng':[lat,lng]},
         'hour2digit': datahour
    }
    app.logger.debug("sending response")
    return flask.jsonify(**f)

@app.route('/segmentapi', methods=['GET'])
def segmentapi():
    app.logger.debug("request contents"+str(request))
    #app.logger.debug("dir request"+str(dir(request)))
    app.logger.debug("get args"+str(request.args))
    lat = request.args.get('lat',40.33)
    lng = request.args.get('lng',-78.8888)
    epoch = request.args.get('time',0)
    time_st = time.localtime(float(epoch))
    weekday = time_st.tm_wday
    hour = time_st.tm_hour
    datahour = getNearestDataHour2Digit(hour)
    record = segobj.query(lat, lng, datahour)
    f = {
         'query': {'time':epoch,'latlng':[lat,lng]},
         'record': record,
    }
    app.logger.debug("sending response")
    return flask.jsonify(**f)


def suggestapistub():
    app.logger.debug("request contents"+str(request))

    f = {'nearestplaces': [
        {'lat':40.7394,'lng':-73.9789,'dst_mi':0.9,'pu_wait':2,'do_wait':15,'do_pu_ratio':1.2,'intersection_name':'Avenue X, Neptune Ave'},
        {'lat':40.7364,'lng':-73.9889,'dst_mi':0.5,'pu_wait':12,'do_wait':99,'do_pu_ratio':0.6,'intersection_name':'Avenue X, 234234 Ave'},
        {'lat':40.7354,'lng':-73.9689,'dst_mi':0.3,'pu_wait':29,'do_wait':3,'do_pu_ratio':1.9,'intersection_name':'Avenue X, 7777 Ave'},
    ],
         'query': {'time':'stub','latlng':[40.736,-73.97]}
    }
    app.logger.debug("sending response")
    return flask.jsonify(**f)

if __name__ == "__main__":
    print "loading data to allow queries:"

    print "done loading data"
    app.run(debug=True,host='0.0.0.0',port=5001)
