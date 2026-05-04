require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const healthRoute = require('./app/routes/health-routes');
const authRoute = require('./app/routes/auth-routes');
const accountRoute = require('./app/routes/account-routes');
const { errorHandler } = require('./app/middleware/errorHandler');

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

const requestMapper = '/api';
app.use(requestMapper, healthRoute);
app.use(requestMapper, authRoute);
app.use(requestMapper, accountRoute);

app.use((req, res) => {
  res.status(404).json({ error: 'No such endpoint exists' });
});

app.use(errorHandler);

const port = process.env.PORT || 9100;

mongoose
  .connect(process.env.MRMS_DB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`MRMS connected to database and listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
