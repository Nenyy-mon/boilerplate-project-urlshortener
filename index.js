require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb')
const uri = "mongodb+srv://jnenad007:jFpN3PSO2MbJYH2W@cluster0.vnow4nq.mongodb.net/urlshortener?retryWrites=true&w=majority"
const client = new MongoClient(uri);
client.connect();
const db = client.db("urlshortener");
const urls = db.collection('urls')
const urlparser = require('url')
const dns = require('dns')
// Basic Configuration
const port = process.env.PORT || 3000;



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function (req, res) {
  const url = req.body.url
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (err, adress) => {
    if (!adress) {
      res.json({ error: "Invalid URL" })
    } else {
      const urlCount = await urls.countDocuments({})
      const urlDoc = {
        url: url,
        short_url: urlCount
      }
      const result = await urls.insertOne(urlDoc)
      res.json({
        original_url: url,
        short_url: urlCount
      })
    }
  })
});

app.get('/api/shorturl/:short_url', async function (req, res) {
  console.log(req.params)
  const shorturl = req.params.short_url;
  const urlDoc = await urls.findOne({ short_url: +shorturl });
  res.redirect(urlDoc.url)
})
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
