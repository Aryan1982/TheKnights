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
const Maintenance = require('./models/Maintenance');

const machineRoutes = require('./routes/machineRoutes');
app.use('/api/machines', machineRoutes);

// MongoDB connection
const wss = new WebSocket.Server({ port: process.env.MONGO_CHNG_WS_PORT });
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: false, useUnifiedTopology: true, })
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
  let ws;
let latestData = null;

function connectWebSocket() {
  try {
    ws = new WebSocket(process.env.STREAM_WS_URI);

    ws.on('open', () => {
      console.log('🌐 Connected to WebSocket:', process.env.STREAM_WS_URI);
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
        console.error('❌ Error parsing WebSocket message:', err.message);
      }
    });

    ws.on('error', (err) => {
      console.error('⚠️ WebSocket error:', err.message);
      // No need to throw — just log and continue
    });

    ws.on('close', () => {
      console.warn('🔌 WebSocket closed. Reconnecting in 5 seconds...');
      setTimeout(connectWebSocket, 500000); // Try to reconnect
    });

  } catch (err) {
    console.error('❌ Failed to initialize WebSocket:', err.message);
    setTimeout(connectWebSocket, 5000); // Retry after delay
  }
}

// Initialize once
connectWebSocket();

// Save latest data to MongoDB every 5 seconds
setInterval(async () => {
  if (latestData) {
    try {
      const entry = new RealTimeData(latestData);
      await entry.save();
      console.log(`✅ Data saved at ${new Date().toLocaleTimeString()}`);

      // Clean up: keep only the latest 25
      const count = await RealTimeData.countDocuments();
      if (count > 25) {
        const toDelete = count - 25;
        await RealTimeData.find({})
          .sort({ timestamp: 1 })
          .limit(toDelete)
          .then(async (docs) => {
            const ids = docs.map((doc) => doc._id);
            await RealTimeData.deleteMany({ _id: { $in: ids } });
            console.log(`🗑️ Deleted ${toDelete} old record(s)`);
          });
      }

    } catch (error) {
      console.error('❌ Error saving to MongoDB:', error.message);
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
app.post('/api/maintenance', async (req, res) => {
  try {
    const data = req.body;
    const maintenance = new Maintenance(data);
    await maintenance.save();
    res.status(201).json(maintenance);
  } catch (error) {
    console.error("Error saving maintenance:", error);
    res.status(500).send("Error saving maintenance data");
  }
});

// Get all maintenance records
app.get('/api/maintenance', async (req, res) => {
  try {
    const records = await Maintenance.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).send("Error fetching maintenance data");
  }
});

// Get a single maintenance record by ID
app.get('/api/maintenance/:id', async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) return res.status(404).send("Maintenance record not found");
    res.json(record);
  } catch (error) {
    res.status(500).send("Error fetching maintenance record");
  }
});

// Update a maintenance record by ID
app.put('/api/maintenance/:id', async (req, res) => {
  try {
    const updated = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).send("Record not found");
    res.json(updated);
  } catch (error) {
    res.status(500).send("Error updating record");
  }
});

// Delete a maintenance record by ID
app.delete('/api/maintenance/:id', async (req, res) => {
  try {
    const deleted = await Maintenance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send("Record not found");
    res.send("Record deleted");
  } catch (error) {
    res.status(500).send("Error deleting record");
  }
});
const axios = require('axios');
const HealthAnomaly = require('./models/healthAnamoly'); // adjust path if needed

ws.on('message', async (message) => {
  try {
    const data = JSON.parse(message.toString());

    // Format data for FastAPI
    const predictionInput = {
      "UDI": data.UDI,
      "Type": 1, // Adjust this if you have type mapping logic
      "Air temperature [K]": String(data["Air temperature [K]"]),
      "Process temperature [K]": String(data["Process temperature [K]"]),
      "Rotational speed [rpm]": String(data["Rotational speed [rpm]"]),
      "Torque [Nm]": String(data["Torque [Nm]"]),
      "Tool wear [min]": String(data["Tool wear [min]"])
    };

    // Send to FastAPI
    const { UDI, ...featuresOnly } = predictionInput;
    const response = await axios.post('http://127.0.0.1:3000/getPred/mod1/', featuresOnly);

    if (response.data && response.data.prediction !== undefined) {
      const predictionValue = response.data.prediction;
      console.log(`🔍 Health prediction: ${predictionValue.toFixed(2)}%`);

      // Save anomaly if prediction < 93%
      if (predictionValue.toFixed(2) < 93) {
        const anomaly = new HealthAnomaly({
          UDI: data.UDI,
          product_id: data["Product ID"],
          type: data.Type,
          air_temperature: parseFloat(data["Air temperature [K]"]),
          process_temperature: parseFloat(data["Process temperature [K]"]),
          rotational_speed: parseFloat(data["Rotational speed [rpm]"]),
          torque: parseFloat(data["Torque [Nm]"]),
          tool_wear: parseFloat(data["Tool wear [min]"]),
          prediction: predictionValue,
          timestamp: new Date(data.timestamp),
        });

        await anomaly.save();
        console.log('🚨 Anomaly saved to DB (healthanomalies)');
      }

    } else {
      console.error('❌ No prediction returned:', response.data);
    }

    // Update latestData (optional real-time logic)
    latestData = {
      ...predictionInput,
      product_id: data["Product ID"],
      type: data.Type,
      timestamp: new Date(data.timestamp),
    };

  } catch (err) {
    console.error('❌ Error in WebSocket handler:', err.message);
  }
});
app.get('/api/healthanomalies', async (req, res) => {
  try {
    const anomalies = await HealthAnomaly.find().sort({ timestamp: -1 }); // newest first
    res.status(200).json(anomalies);
  } catch (error) {
    console.error('❌ Error fetching anomalies:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.listen(port, () => {
  console.log(`Node.js server is running on http://localhost:${port}`);
});
