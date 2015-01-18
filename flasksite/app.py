'''
Go Taxi

Will Groves 2015.1.12

'''
from flask import Flask, flash, redirect, render_template, \
     request, url_for
import flask, os, time


#local imports
from WaitTimeQueryKDTree import WaitTimeQuery

def getNearestDataHour2Digit(hour):
    '''
determines which hour to request based on the data we have
    '''
    closest = hour%24
    availhourl = [0,1,3,7,8,10,12,13,14,15,16,17,18,19,20,21,22,23]
    dsthourtupl = zip([abs(closest-h) for h in availhourl],availhourl)
    dsthourtupl.sort()
    return "%02d"%dsthourtupl[0][1]
    
wtqobj = WaitTimeQuery()

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
#@app.route('/', methods=['GET','POST'])
#def ui():
#    return redirect(url_for('static', filename='ui.html'))

@app.route('/', methods=['GET',])
def table():
    return redirect('/static/splash/index.html')#url_for('static/splash/', filename='index.html'))

##
#@app.route('/table', methods=['GET',])
#def table():
#    return redirect(url_for('static/jsonTable', filename='index.html'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != 'admin' or \
                request.form['password'] != 'secret':
            flash(u'Invalid password provided', 'error')
            error = 'Invalid credentials'
        else:
            flash('You were successfully logged in')
            return redirect(url_for('index'))
    return render_template('login.html', error=error)

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
    app.run(debug=False,host='0.0.0.0',port=80)
