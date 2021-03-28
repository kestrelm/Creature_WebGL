import http.server
import socketserver

PORT = 8887

class Handler(http.server.SimpleHTTPRequestHandler):
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

httpd = socketserver.TCPServer(("127.0.0.1", PORT), Handler)
print ("Serving at port: %d" %PORT)
httpd.serve_forever()