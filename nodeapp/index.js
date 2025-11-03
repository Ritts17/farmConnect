const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = express();

// CORS configuration
app.use(
  cors({
    //  origin: 'https://8081-dacaccbfeccafcebfafabcccadcbedb.premiumproject.examly.io',
    // origin : 'https://8081-bfbabcfbfcebfafabcccadcbedb.premiumproject.examly.io',        //ritesh
    //https://8081-cabcdfcbebebfaacebfafabcccadcbedb.premiumproject.examly.io  //soujanya
    // origin: 'https://8081-cdbfdadaafdaedbdcebfafabcccadcbedb.premiumproject.examly.io',   // akshita
    //https://8081-fdfdeacfbedecebfafabcccadcbedb.premiumproject.examly.io     //ayush
    origin : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'livestock');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const userRouter = require('./routers/userRouter.js');
const feedRouter = require('./routers/feedRouter.js');
const livestockRouter = require('./routers/liveStockRouter.js');
const requestRouter = require('./routers/requestRouter.js');
const medicineRouter = require('./routers/medicineRouter.js');
const feedbackRouter = require('./routers/feedbackRouter.js');

// Use routes
app.use('/api', userRouter);
app.use('/api', feedRouter);
app.use('/api', livestockRouter);
app.use('/api', requestRouter);
app.use('/api', medicineRouter);
app.use('/api', feedbackRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const port = 8080;

// MongoDB connection
mongoose
  .connect('mongodb://localhost:27017/farmConnect', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB - farmconnect database');
    app.listen(port, () =>
      console.log(`FarmConnect backend listening on http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

module.exports = app;