import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import process from 'node:process'

const root = resolve('.output/public')
const port = Number(process.env.PORT || 4173)
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
}
// AI modified: exercise the exact static output locally, including route refreshes and service workers.
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname)
    let file = resolve(root, `.${pathname}`)
    let status = 200
    if (file !== root && !file.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end()
      return
    }
    try {
      if ((await stat(file)).isDirectory())
        file = resolve(file, 'index.html')
    }
    catch {
      if (!extname(pathname)) {
        try {
          await stat(`${file}.html`)
          file = `${file}.html`
        }
        catch {
          file = resolve(root, '404.html')
          status = 404
        }
      }
    }
    const contents = await readFile(file)
    response.writeHead(status, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' })
    response.end(contents)
  }
  catch { response.writeHead(404).end('Not found') }
}).listen(port, '127.0.0.1', () => { process.stdout.write(`Frontend glossary: http://127.0.0.1:${port}\n`) })
