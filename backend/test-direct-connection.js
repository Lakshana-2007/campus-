const mongoose = require('mongoose');

const uri = 'mongodb://jamey8085_db_user:tpv4ANlULkjrx20N@ac-jbjqals-shard-00-00.pvyr8un.mongodb.net:27017,ac-jbjqals-shard-00-01.pvyr8un.mongodb.net:27017,ac-jbjqals-shard-00-02.pvyr8un.mongodb.net:27017/campushub?ssl=true&replicaSet=atlas-jbjqals-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(conn => {
    console.log('Direct MongoDB connection success:', conn.connection.host);
    process.exit(0);
  })
  .catch(err => {
    console.error('Direct connection failed:', err);
    process.exit(1);
  });
