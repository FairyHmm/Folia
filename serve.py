#!/usr/bin/env python3
"""
Run CV processing backend server locally.
Frontend (vite) proxies /api/process -> localhost:3000.

Usage: python serve.py
"""
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent / "api"))

from cv_analysis.extract import extract


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length) if length else b""
            data = json.loads(body) if body else {}
        except (json.JSONDecodeError, ValueError):
            self._respond(400, {"error": "Invalid JSON"})
            return

        text = data.get("text", "")
        if not text or not isinstance(text, str):
            self._respond(400, {"error": "Missing 'text' field"})
            return

        result = extract(text)
        self._respond(200, result)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _respond(self, code, body):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(body, ensure_ascii=False).encode())

    def log_message(self, fmt, *args):
        print(f"[backend] {args[0]}")


if __name__ == "__main__":
    port = 3000
    server = HTTPServer(("localhost", port), Handler)
    print(f"Backend running at http://localhost:{port}")
    print("Frontend proxy: /api/process -> this server")
    print("Ctrl+C to stop\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
