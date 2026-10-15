#!/usr/bin/env python3
"""Restricted local control: only select an existing, validated profile."""
import http.server
import json
import os
import re
import socketserver
import subprocess
from pathlib import Path

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def do_POST(self):
        try:
            if self.path != '/select' or not 0 < int(self.headers.get('Content-Length', '0')) < 256:
                raise ValueError('Invalid request')
            hostname = json.loads(self.rfile.read(int(self.headers['Content-Length'])))['hostname']
            if not isinstance(hostname, str) or not re.fullmatch(r'[a-z]{2}-[a-z0-9]+-wg-[0-9]{3}', hostname):
                raise ValueError('Invalid location')
            profile = Path('/etc/wireguard/novene-locations') / (hostname + '.conf')
            if not profile.is_file() or profile.is_symlink():
                raise ValueError('Unavailable location')
            subprocess.run(['ip', 'netns', 'exec', 'novene-vpn', 'wg', 'setconf', 'nvewg0', str(profile)], check=True, timeout=8, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            state = Path('/var/lib/novene-vpn/selection.json')
            temporary = state.with_suffix('.tmp')
            temporary.write_text(json.dumps({'hostname': hostname}))
            os.replace(temporary, state)
            body = b'{"ok":true}'
            self.send_response(200)
        except Exception:
            body = b'{"error":"Location change failed"}'
            self.send_response(400)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

class Server(socketserver.UnixStreamServer):
    allow_reuse_address = True

socket = '/run/novene-vpn-control/control.sock'
Path(socket).unlink(missing_ok=True)
with Server(socket, Handler) as server:
    os.chmod(socket, 0o660)
    server.serve_forever()
