const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;
const reservationsRouter = require('./routes/reservationController');
const roomRouter = require('./routes/roomController')

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('backend quinta do ypuã! :)');
});

app.use('/reservation', reservationsRouter);
app.use('/room', roomRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
