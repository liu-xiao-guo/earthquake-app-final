const express = require('express');
const router = express.Router();
const axios = require('axios')
const client = require('../../elasticsearch/client');
const URL = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson`;

 //======= Check that Elasticsearch is up and running =======\\
function pingElasticsearch() {
    console.log("ping .....")
    client.ping({
        requestTimeout: 30000,
      }, function(error,res) {
        if (error) {
            console.error('elasticsearch cluster is down!');
        } else {
            console.log('Elasticsearch Ready');
        }
    });
};

// ====== Get Data From USGS and then index into Elasticsearch
indexAllDocs = async () => {
    try {
        const EARTHQUAKES = await axios.get(`${URL}`,{
            headers: {
                'Content-Type': [
                    'application/json',  
                    'charset=utf-8' 
                ]
            }
        });

        console.log('Getting Data From Host')

        results = EARTHQUAKES.data.features    
    
        results.map(
            async (results) => (
              (earthquakeObject = {
                place: results.properties.place, 
                time: results.properties.time,   
                url: results.properties.url,     
                sig: results.properties.sig,     
                mag: results.properties.mag,     
                type: results.properties.type,   
                longitude: results.geometry.coordinates[0], 
                latitude: results.geometry.coordinates[1], 
                depth: results.geometry.coordinates[2], 
              }),
              await client.index({
                index: 'earthquakes',
                id: results.id,
                body: earthquakeObject,
                pipeline: 'earthquake_data_pipeline'
              })
            )
        );

        if (EARTHQUAKES.data.length) {
            indexAllDocs();
        } else {
            console.log('All Data Has Been Indexed!');
        };
    } catch (err) {
        console.log(err)
    };

    console.log('Preparing For The Next Data Check...');
}


//================== Official API Call ==================\\
router.get('/earthquakes', function (req, res) {
    res.send('Running Application...');
    console.log('Loading Application...')
    
    setInterval(() => { 
        indexAllDocs(res);
    }, 120000);

});
 
module.exports = router;