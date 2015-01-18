'''
webserver script for my flask app using tornado webserver
'''

from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
import app
import localconfig

http_server = HTTPServer(WSGIContainer(app.app))
http_server.listen(localconfig.port)
IOLoop.instance().start()
