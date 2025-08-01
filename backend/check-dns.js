const dns = require('dns').promises;
(async () => {
  try {
    const r = await dns.resolveSrv('_mongodb._tcp.cluster0.pvyr8un.mongodb.net');
    console.log('SRV records:', JSON.stringify(r, null, 2));
    const a = await dns.resolve4('cluster0.pvyr8un.mongodb.net');
    console.log('A records:', JSON.stringify(a, null, 2));
  } catch (err) {
    console.error('DNS error:', err);
  }
})();