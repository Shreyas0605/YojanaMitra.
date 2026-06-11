"""
Serves the React build + API endpoints for local testing.
Supports Range requests (needed for video scrubbing).
Usage: python serve_react.py
"""
import http.server
import json
import os
import re
import socketserver
import mimetypes

PORT = 3000
DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/build')


class Handler(http.server.SimpleHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/current-ai':
            self._send_json({'provider': 'gemini', 'label': 'Google (Gemini)'})
            return
        if self.path == '/api/public-stats':
            self._send_json({
                'registeredUsers': 125000, 'totalSchemes': 45,
                'documentsProcessed': 89000, 'citizensMatched': 125000
            })
            return
        self._serve_file()

    def do_POST(self):
        if self.path == '/api/toggle-ai':
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length)) if length else {}
            provider = body.get('provider', 'gemini')
            self._send_json({'status': 'success', 'provider': provider})
            return
        self.send_response(404)
        self.end_headers()

    def _send_json(self, data):
        b = json.dumps(data).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def _serve_file(self):
        clean_path = self.path.split('?')[0]
        path = self.translate_path(clean_path)
        if os.path.isdir(path):
            path = os.path.join(path, 'index.html')
        if not os.path.isfile(path):
            self.send_error(404, 'File not found')
            return

        ctype = self.guess_type(path)
        size = os.path.getsize(path)
        range_header = self.headers.get('Range')

        if range_header:
            m = re.match(r'bytes=(\d+)-(\d+)?', range_header)
            if m:
                start = int(m.group(1))
                end = int(m.group(2)) if m.group(2) else size - 1
                if start >= size:
                    self.send_response(416)
                    self.send_header('Content-Range', f'bytes */{size}')
                    self.end_headers()
                    return
                end = min(end, size - 1)
                length = end - start + 1
                self.send_response(206)
                self.send_header('Content-Type', ctype)
                self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
                self.send_header('Content-Length', str(length))
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Cache-Control', 'no-cache')
                self.end_headers()
                with open(path, 'rb') as f:
                    f.seek(start)
                    remaining = length
                    while remaining:
                        chunk = f.read(min(65536, remaining))
                        if not chunk:
                            break
                        try:
                            self.wfile.write(chunk)
                        except ConnectionResetError:
                            return
                        remaining -= len(chunk)
                return

        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(size))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        with open(path, 'rb') as f:
            remaining = size
            while remaining:
                chunk = f.read(min(65536, remaining))
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except ConnectionResetError:
                    return
                remaining -= len(chunk)


if __name__ == '__main__':
    os.chdir(DIR)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving React build at http://localhost:{PORT}")
        httpd.serve_forever()
