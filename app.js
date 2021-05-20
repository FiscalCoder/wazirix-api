import express from 'express';
import 'dotenv/config'
import axios from 'axios';
import path from 'path'
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const app = express();

console.log(dirname)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = 3001

// View engine setup
app.set('view engine', 'ejs');
app.use(express.static(path.join(dirname, '/public')));
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  // res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.get('/', async (req, res) => {
  let wazirixData

  try {
    wazirixData = await axios.get('https://api.wazirx.com/api/v2/tickers')
  } catch (error) {
    console.log(error)
  }

  if (wazirixData.status === 200) {
    const processData = wazirixData.data

    const ejsData = []

    Object.keys(processData).forEach((key) => {
      if (ejsData.length !== 10) ejsData.push(processData[key])
    });

    res.render('index', { data: ejsData });
  } else res.render('not-found');
})

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
