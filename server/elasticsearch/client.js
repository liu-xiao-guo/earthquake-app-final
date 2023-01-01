const { Client } = require('@elastic/elasticsearch');
const config = require('config');
const fs = require('fs')

const elasticConfig = config.get('elastic');

const client = new Client ( {
  node: elasticConfig.elasticsearch_endpoint, 
   auth: {
     apiKey: elasticConfig.apiKey
   }, 
   tls: {
    ca: fs.readFileSync(elasticConfig.certificate),
    rejectUnauthorized: true
   }     
});

// const client = new Client ( {
//   node: elasticConfig.elasticsearch_endpoint,
//   auth: { 
//     username: elasticConfig.username,
//     password: elasticConfig.password
//    }, 
//    tls: {
//     ca: fs.readFileSync(elasticConfig.certificate),
//     rejectUnauthorized: true
//    }
// });

client.ping()
  .then(response => console.log("You are connected to Elasticsearch!"))
  .catch(error => console.error("Elasticsearch is not connected."))

module.exports = client; 