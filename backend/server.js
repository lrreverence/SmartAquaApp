const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Enable CORS for your React Native app
app.use(cors());
app.use(bodyParser.json());

// Store the latest data
let latestData = {
  timestamp: Date.now(),
  temperature: 0,
  ph: 0,
  turbidity: 0
};

// Endpoint to receive data from Arduino
app.post('/arduino-data', (req, res) => {
  const { temperature, ph, turbidity } = req.body;
  
  latestData = {
    timestamp: Date.now(),
    temperature: parseFloat(temperature),
    ph: parseFloat(ph),
    turbidity: parseFloat(turbidity)
  };

  console.log('Received new data:', latestData);
  res.json({ success: true });
});

// Endpoint to get the latest data
app.get('/arduino-data', (req, res) => {
  res.json([latestData]); // Return as array to match frontend expectations
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 