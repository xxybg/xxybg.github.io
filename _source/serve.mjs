// 本地预览：node _source/serve.mjs [--port 4321]
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argPort = process.argv.indexOf('--port')
const PORT = Number(argPort > -1 ? process.argv[argPort + 1] : process.env.PORT || 4321)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2'
}

const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  let file = path.join(ROOT, pathname)

  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden')
    return
  }

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    const index = path.join(file, 'index.html')
    file = fs.existsSync(index) ? index : path.join(ROOT, '404.html')
  }

  if (!fs.existsSync(file)) {
    const notFound = path.join(ROOT, '404.html')
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
    res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : '404')
    return
  }

  res.writeHead(200, {
    'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'cache-control': 'no-store'
  })
  fs.createReadStream(file).pipe(res)
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`♪ 预览地址 http://127.0.0.1:${PORT}/`)
})
