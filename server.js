require('ts-node').register();
const { initSocket } = require('./src/lib/socket');

initSocket().catch(console.error); 