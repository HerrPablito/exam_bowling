const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
require('dotenv').config()
const mongoose = require('mongoose');
app.use(express.json())
const bookingRouter = require('./routes/booking.routes');
mongoose.connect(process.env.DATABASE_URL);
const database = mongoose.connection;


app.use('/api/booking', bookingRouter  )


database.on('error', (error) => {
    console.log('Error connecting to database', error);
});

database.once('connected', () => {
    console.log('Connected to database');
});

app.listen(PORT, () => {
    
    console.log('server started at:' + PORT);
})

module.exports = database;