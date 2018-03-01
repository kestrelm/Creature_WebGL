import SimpleHTTPServer
import SocketServer

PORT = 8887

class Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    pass

Handler.extensions_map= {
    '.manifest': 'text/cache-manifest',
	'.html': 'text/html',
    '.png': 'image/png',
	'.jpg': 'image/jpg',
	'.svg':	'image/svg+xml',
	'.css':	'text/css',
	'.js':	'application/x-javascript',
    '.wasm': 'application/wasm',
	'': 'application/octet-stream', # Default
    }

httpd = SocketServer.TCPServer(("127.0.0.1", PORT), Handler)
print "serving at port", PORT
httpd.serve_forever()