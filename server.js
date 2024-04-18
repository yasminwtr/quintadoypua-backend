const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3001;
require("dotenv-safe").config();

const authRouter = require('./routes/authController');
const clientRouter = require('./routes/clientController');
const employeeRouter = require('./routes/employeeController');
const reservationsRouter = require('./routes/reservationController');
const roomRouter = require('./routes/roomController')

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

  const tokenWithoutBearer = token.replace('Bearer ', '');

  jwt.verify(tokenWithoutBearer, process.env.SECRET, function (err, decoded) {
    console.log(token);
    console.log(err);
    if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });

    req.userId = decoded.id;
    next();
  });
}

app.get('/', verifyJWT, (req, res) => {
  res.send('backend quinta do ypuã! :)');
});

app.use('/auth', authRouter);
app.use('/client', clientRouter);
app.use('/employee', employeeRouter);
app.use('/reservation', reservationsRouter);
app.use('/room', roomRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
