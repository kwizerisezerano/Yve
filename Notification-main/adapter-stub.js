const http = require('http');

http.createServer((req, res) => {
  console.log(req.method, req.url);
  if (req.method === 'GET' && /\/providers\/.+\/health$/.test(req.url)) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ provider: 'test', available: true }));
  }
  if (req.method === 'POST' && /\/providers\/.+\/messages$/.test(req.url)) {
    let body = '';
    req.on('data', (c) => (body += c));
    return req.on('end', () => {
      console.log('body:', body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ accepted: true, providerMessageId: 'pm1' })); // flip to accepted:false + errorCode to test rejection
    });
  }
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', (c) => (body += c));
    return req.on('end', () => {
      console.log('WEBHOOK RECEIVED:', body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{}');
    });
  }
  res.writeHead(404).end();
}).listen(4002, () => console.log('adapters stub on 4002'));
