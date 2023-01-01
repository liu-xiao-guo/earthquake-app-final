const express = require('express');
const client = require('./elasticsearch/client');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');

const app = express();

const port = 5001;

//Define Routes
const data = require('./routes/api/data')
app.use('/api/data', data);

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

app.use(cors());

app.get('/results', (req, res) => {
  const passedType = req.query.type;
  const passedMag = req.query.mag;
  const passedLocation = req.query.location;
  const passedDateRange = req.query.dateRange;
  const passedSortOption = req.query.sortOption;

  console.log("passedType = " + passedType);
  console.log("passedMag = " + passedMag);
  console.log("passedLocation = " + passedLocation);
  console.log("passedDateRange = " + passedDateRange);
  console.log("passedSortOption = " + passedSortOption);

  var request = {
    sort: [
      {
        mag: {
          order: passedSortOption,
        },
      },
    ],
    size: 300,
    query: {
      bool: {
        filter: [
          {
            term: { type: passedType },
          },
          {
            range: {
              mag: {
                gte: passedMag,
              },
            },
          },
          {
            match: { place: passedLocation },
          },
          // for those who use prettier, make sure there is no whitespace.
          {
            range: {
              '@timestamp': {
                gte: `now-${passedDateRange}d`,
                lt: 'now',
              },
            },
          },
        ],
      },
    },
  }

  console.log("request = " + JSON.stringify(request));

  async function sendESRequest() {
    const body = await client.search({
      index: 'earthquakes',
      body: request,
    });

    console.log(body);
    res.json(body.hits.hits);
  }

  console.log("Send ES Request ....")
  sendESRequest();
});  

app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));