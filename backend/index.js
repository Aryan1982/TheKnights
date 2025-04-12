// server.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const WebSocket = require('ws');
const app = express();
const port = 5001;


app.use(express.json());
app.use(cors());

const machineRoutes = require('./routes/machineRoutes');
app.use('/api/machines', machineRoutes);

// MongoDB connection
const wss = new WebSocket.Server({ port: process.env.MONGO_CHNG_WS_PORT });
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: false })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("Failed to connect to MongoDB", err));

// Define a MongoDB model (example)
const DataSchema = new mongoose.Schema({
  name: String,
  value: Number,
});

const Data = mongoose.model('Datavalue', DataSchema);


const DataSchem = new mongoose.Schema({
    UDI: String,
    product_id: String,
    type: String,
    air_temperature: Number,
    process_temperature: Number,
    rotational_speed: Number,
    torque: Number,
    tool_wear: Number,
    timestamp: Date,
  });
  
  const RealTimeData = mongoose.model('RealTimeData', DataSchem);
  // Real-time data API (example GET)
app.get('/api/getdata', async (req, res) => {
  try {
    const data = await RealTimeData.find(); // Get all data
    res.json(data);
  } catch (error) {
    res.status(500).send("Error fetching data");
  }
});
  // Connect to WebSocket source (the one sending you real-time data)
  const ws = new WebSocket(process.env.STREAM_WS_URI); // Replace with your actual socket address
  
  let latestData = null;
  
  ws.on('open', () => {
    console.log('🌐 Connected to source WebSocket (8765)');
  });
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
  
      // Clean and format data
      latestData = {
        UDI: data.UDI,
        product_id: data['Product ID'],
        type: data.Type,
        air_temperature: parseFloat(data['Air temperature [K\r\n]'] || data['Air temperature [K]']),
        process_temperature: parseFloat(data['Process temperature [K\r\n]'] || data['Process temperature [K]']),
        rotational_speed: parseFloat(data['Rotational speed [rpm\r\n]'] || data['Rotational speed [rpm]']),
        torque: parseFloat(data['Torque [Nm\r\n]'] || data['Torque [Nm]']),
        tool_wear: parseFloat(data['Tool wear [min\r\n]'] || data['Tool wear [min]']),
        timestamp: new Date(data.timestamp),
      };
  
    } catch (err) {
      console.error('❌ Error parsing message:', err.message);
    }
  });
  
  // // Save latest data to MongoDB every 3 seconds
  setInterval(async () => {
    if (latestData) {
      try {
        const entry = new RealTimeData(latestData);
        await entry.save();
        console.log(`✅ Data saved at ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error('❌ Error saving to DB:', error.message);
      }
    }
  }, 5000);
  
wss.on('connection', (ws) => {
    console.log("Client connected via WebSocket");
  
    // Send data every 5 seconds
    setInterval(async () => {
      const data = await RealTimeData.find().sort({ timestamp: -1 }).limit(10);  // Fetch data from MongoDB
      ws.send(JSON.stringify(data));
      console.log(JSON.stringify(data));
        // Send data to client
    }, 3000);  // Send data every 5 seconds
  });
// const changeStream = Data.watch();

// // When a change occurs, trigger this function
// changeStream.on('change', (change) => {
//   console.log('Change detected:', change);
//   // You can send the updated data to a WebSocket or an API to notify the frontend
// });

app.get('/test', async (req, res) => {
  try {
    res.status(200).send("Test endpoint is working!");
  } catch (error) {
    res.status(500).send("Error fetching data");
  }
});

// POST example to insert data
app.post('/api/data', express.json(), async (req, res) => {
  const { name, value } = req.body;
  try {
    const newData = new Data({ name, value });
    await newData.save();
    res.status(201).json(newData);
  } catch (error) {
    res.status(500).send("Error creating data");
  }
});

app.listen(port, () => {
  console.log(`Node.js server is running on http://localhost:${port}`);
});
