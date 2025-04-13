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
const axios = require('axios');
const HealthAnomaly = require('./models/healthAnamoly'); // Adjust path if needed
const Maintenance = require('./models/Maintenance');
const RealTimeData = require('./models/RealTimeData'); // Real-time data model

app.use('/api/machines', machineRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("Failed to connect to MongoDB", err));

// WebSocket setup
const wss = new WebSocket.Server({ port: process.env.MONGO_CHNG_WS_PORT });

// Real-time data save to DB
let latestData = null;

function saveRealTimeData(machineType) {
  setInterval(async () => {
    if (latestData) {
      try {
        const entry = new RealTimeData(latestData);
        await entry.save();
        console.log(`✅ Data saved for ${machineType} at ${new Date().toLocaleTimeString()}`);

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
}

function connectWebSocket() {
  try {
    const ws = new WebSocket(`${process.env.STREAM_WS_URI}/cnc`);

    ws.on('open', () => {
      console.log('🌐 Connected to CNC WebSocket');
    });

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Format CNC data
        latestData = {
          UDI: data.UDI,
          product_id: data['Product ID'],
          type: data.Type,
          air_temperature: data['Air temperature [K]'],
          process_temperature: data['Process temperature [K]'],
          rotational_speed: data['Rotational speed [rpm]'],
          torque: data['Torque [Nm]'],
          tool_wear: data['Tool wear [min]'],
          timestamp: new Date(data.timestamp),
        };

        // Send data for prediction (assuming FastAPI is running on a different service)
        const predictionInput = {
          "Type": data.Type,
          "Air temperature [K]": data["Air temperature [K]"],
          "Process temperature [K]": data["Process temperature [K]"],
          "Rotational speed [rpm]": data["Rotational speed [rpm]"],
          "Torque [Nm]": data["Torque [Nm]"],
          "Tool wear [min]": data["Tool wear [min]"],
        };

        // Send data to FastAPI
        const response = await axios.post('http://34.59.81.216:3000/getPred/cnc/', predictionInput);

        if (response.data && response.data.prediction !== undefined) {
          const predictionValue = response.data.prediction;
          const status = response.data.status;
          const diagnosis = response.data.diagnosis;

          // If prediction < 93%, save anomaly to DB
          if (predictionValue < 93) {
            const anomaly = new HealthAnomaly({
              UDI: data.UDI,
              product_id: data["Product ID"],
              type: data.Type,
              air_temperature: data["Air temperature [K]"],
              process_temperature: data["Process temperature [K]"],
              rotational_speed: data["Rotational speed [rpm]"],
              torque: data["Torque [Nm]"],
              tool_wear: data["Tool wear [min]"],
              Health: predictionValue,
              Status: status,
              Diagnosis: diagnosis,
              machineId: '67fb5998858e726dd728b219',  // Example machine ID
              timestamp: new Date(data.timestamp),
            });

            await anomaly.save();
            console.log('🚨 CNC anomaly saved to DB');
          }
        } else {
          console.error('❌ No prediction returned for CNC:', response.data);
        }
      } catch (err) {
        console.error('❌ CNC WebSocket Error:', err.message);
      }
    });

    ws.on('close', () => {
      console.warn('🔌 CNC WebSocket closed. Reconnecting...');
      setTimeout(connectWebSocket, 5000);
    });

    ws.on('error', (err) => {
      console.error('⚠️ CNC WebSocket error:', err.message);
    });
  } catch (err) {
    console.error('❌ Failed to connect to CNC WebSocket:', err.message);
    setTimeout(connectWebSocket, 5000);
  }
}

// Start CNC WebSocket connection
connectWebSocket();
saveRealTimeData('CNC');

function connectWeldingSocket() {
  try {
    const weldingWS = new WebSocket(`${process.env.STREAM_WS_URI}/velding`);

    weldingWS.on('open', () => {
      console.log('🔧 Connected to Welding WebSocket');
    });

    weldingWS.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Format Welding data
        latestData = {
          step_in_cycle: data.step_in_cycle,
          operating_condition: data.operating_condition,
          vibration_rms: data.vibration_rms,
          temperature: data.temperature,
          pressure: data.pressure,
          rotational_speed: data.rotational_speed,
          current: data.current,
          timestamp: new Date(data.timestamp),
        };

        // Send data for prediction to FastAPI
        const predictionInput = {
          "step_in_cycle": data["step_in_cycle"],
          "operating_condition": data["operating_condition"],
          "vibration_rms": data["vibration_rms"],
          "temperature": data["temperature"],
          "pressure": data["pressure"],
          "rotational_speed": data["rotational_speed"],
          "current": data["current"],
        };

        const response = await axios.post('http://34.59.81.216:3000/getPred/welding/', predictionInput);

        if (response.data && response.data.prediction !== undefined) {
          const predictionValue = response.data.prediction;
          const status = response.data.status;
          const diagnosis = response.data.diagnosis;

          // If prediction < 93%, save anomaly to DB
          if (predictionValue < 93) {
            const anomaly = new HealthAnomaly({
              machineId: '67fb59f5858e726dd728b277',  // Example machine ID for welding
              machineType: 'welding',
              vibration_rms: predictionInput.vibration_rms,
              temperature: predictionInput.temperature,
              pressure: predictionInput.pressure,
              rotational_speed: predictionInput.rotational_speed,
              current: predictionInput.current,
              Health: predictionValue,
              Status: status,
              Diagnosis: diagnosis,
              timestamp: new Date(data.timestamp),
            });

            await anomaly.save();
            console.log('🚨 Welding anomaly saved to DB');
          }
        } else {
          console.error('❌ No welding prediction returned:', response.data);
        }
      } catch (err) {
        console.error('❌ Welding WebSocket Error:', err.message);
      }
    });

    weldingWS.on('close', () => {
      console.warn('🔌 Welding WebSocket closed. Reconnecting...');
      setTimeout(connectWeldingSocket, 5000);
    });

    weldingWS.on('error', (err) => {
      console.error('⚠️ Welding WebSocket error:', err.message);
    });
  } catch (err) {
    console.error('❌ Failed to connect to Welding WebSocket:', err.message);
    setTimeout(connectWeldingSocket, 5000);
  }
}

// Start Welding WebSocket connection
connectWeldingSocket();
saveRealTimeData('Welding');

// Function for pump WebSocket connection (similar to CNC and Welding)
function connectPumpSocket() {
  try {
    const pumpWS = new WebSocket(`${process.env.STREAM_WS_URI}/pump`);

    pumpWS.on('open', () => {
      console.log('💧 Connected to Pump WebSocket');
    });

    pumpWS.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Format Pump data
        latestData = {
          pressure_psi: data.pressure_psi,
          flow_rate_gpm: data.flow_rate_gpm,
          temperature_celsius: data.temperature_celsius,
          vibration_mm_s: data.vibration_mm_s,
          power_consumption_kw: data.power_consumption_kw,
          noise_level_db: data.noise_level_db,
          oil_viscosity: data.oil_viscosity,
          timestamp: new Date(data.timestamp),
        };

        // Send data for prediction
        const predictionInput = {
          pressure_psi: data["pressure_psi"],
          flow_rate_gpm: data["flow_rate_gpm"],
          temperature_celsius: data["temperature_celsius"],
          vibration_mm_s: data["vibration_mm_s"],
          power_consumption_kw: data["power_consumption_kw"],
          noise_level_db: data["noise_level_db"],
          oil_viscosity: data["oil_viscosity"],
        };
        // console.log(predictionInput,"predictionInput welding");

        const response = await axios.post('http://34.59.81.216:3000/getPred/pump/', predictionInput);


        if (response.data && response.data.prediction !== undefined) {
          const predictionValue = response.data.prediction;
          const status = response.data.status;
          const diagnosis = response.data.diagnosis;
console.log(diagnosis,"ggg");

          // If prediction < 93%, save anomaly to DB
          if (predictionValue < 93) {
            const anomaly = new HealthAnomaly({
              machineId: 'pump-5678',  // Example machine ID for pump
              machineType: 'pump',
              pressure_psi: predictionInput.pressure_psi,
              flow_rate_gpm: predictionInput.flow_rate_gpm,
              temperature_celsius: predictionInput.temperature_celsius,
              vibration_mm_s: predictionInput.vibration_mm_s,
              power_consumption_kw: predictionInput.power_consumption_kw,
              noise_level_db: predictionInput.noise_level_db,
              oil_viscosity: predictionInput.oil_viscosity,
              Health: predictionValue,
              Status: status,
              Diagnosis: diagnosis,
              timestamp: new Date(data.timestamp),
            });

            await anomaly.save();
            console.log('🚨 Pump anomaly saved to DB');
          }
        } else {
          console.error('❌ No pump prediction returned:', response.data);
        }
      } catch (err) {
        console.error('❌ Pump WebSocket handler error:', err.message);
      }
    });

    pumpWS.on('close', () => {
      console.warn('🔌 Pump WebSocket closed. Reconnecting...');
      setTimeout(connectPumpSocket, 5000);
    });

    pumpWS.on('error', (err) => {
      console.error('⚠️ Pump WebSocket error:', err.message);
    });
  } catch (err) {
    console.error('❌ Failed to connect to Pump WebSocket:', err.message);
    setTimeout(connectPumpSocket, 5000);
  }
}

// Start Pump WebSocket connection
connectPumpSocket();
saveRealTimeData('Pump');

// Health Anomalies API
app.get('/api/healthanomalies', async (req, res) => {
  try {
    const anomalies = await HealthAnomaly.find().sort({ timestamp: -1 }); // newest first
    res.status(200).json(anomalies);
  } catch (error) {
    console.error('❌ Error fetching anomalies:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Maintenance API routes
app.post('/api/maintenance', async (req, res) => {
  try {
    const maintenance = new Maintenance(req.body);
    await maintenance.save();
    res.status(201).json(maintenance);
  } catch (error) {
    console.error("Error saving maintenance:", error);
    res.status(500).send("Error saving maintenance data");
  }
});

app.get('/api/maintenance', async (req, res) => {
  try {
    const records = await Maintenance.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).send("Error fetching maintenance data");
  }
});

app.get('/api/maintenance/:id', async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) return res.status(404).send("Maintenance record not found");
    res.json(record);
  } catch (error) {
    res.status(500).send("Error fetching maintenance record");
  }
});

app.put('/api/maintenance/:id', async (req, res) => {
  try {
    const updated = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).send("Maintenance record not found");
    res.json(updated);
  } catch (error) {
    res.status(500).send("Error updating maintenance record");
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});