require('dotenv').config();
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const cors = require('cors');
const axios = require('axios');
const Schema = require('./schema');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5001;
const PP_API_URL = process.env.PP_API_URL;
const PLAYNGO_API_URL = process.env.PLAYNGO_API_URL;
const UNIBO_API_URL = process.env.UNIBO_API_URL;
const AMUSNET_API_URL = process.env.AMUSNET_API_URL;
const EGT_DIGITAL_API_URL = process.env.EGT_DIGITAL_API_URL;


// REST API
app.get('/pp-jackpots', async (req, res) => {
    try {
        const response = await axios.get(PP_API_URL);
        if (response.data.error !== "0") {
            return res.status(500).json({ error: "API Error: " + response.data.description });
        }

        const jackpots = response.data.jackpots.map(jackpot => ({
            tiers: jackpot.tiers.map(tier => ({
                tier: tier.tier,
                amount: tier.amount
            }))
        }));

        res.json({ jackpots });
    } catch (error) {
        console.error("Error fetching data:", error.message);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.get('/playngo-jackpots', async (req, res) => {
  try {
    const response = await axios.get(PLAYNGO_API_URL);

    // Check for errors if applicable (adjust if your API doesn't use this structure)
    if (response.data.error && response.data.error !== "0") {
      return res.status(500).json({ error: "API Error: " + response.data.description });
    }

    // Assuming the API returns an array of jackpot objects
    const jackpots = response.data.map(jackpot => ({
      JackpotId: jackpot.JackpotId,
      BaseAmount: jackpot.BaseAmount,
      NumPayouts: jackpot.NumPayouts,
    }));

    res.json({ jackpots });
  } catch (error) {
    console.error("Error fetching Play'n GO jackpots:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get('/unibo-campaigns', async (req, res) => {
  try {
    const response = await axios.request({
      url: UNIBO_API_URL,
      method: req.method, // This will typically be 'GET'
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // Replace with your actual token.
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching Unibo campaigns:", error.message);
    res.status(500).json({ error: "Failed to fetch Unibo campaigns" });
  }
});

app.get('/amusnet-jackpots', async (req, res) => {
  try {
    const response = await axios.request({
      url: AMUSNET_API_URL,
      method: req.method, // This will typically be 'GET'
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // Replace with your actual token.
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching Unibo campaigns:", error.message);
    res.status(500).json({ error: "Failed to fetch Unibo campaigns" });
  }
});

app.get('/egt-digital-jackpots', async (req, res) => {
  try {
    const response = await axios.request({
      url: EGT_DIGITAL_API_URL,
      method: req.method, // This will typically be 'GET'
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // Replace with your actual token.
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching Unibo campaigns:", error.message);
    res.status(500).json({ error: "Failed to fetch Unibo campaigns" });
  }
});



// GraphQL API
app.use('/graphql', graphqlHTTP({
  schema: Schema,
  graphiql: true,
}));


const HOST = '0.0.0.0';  // Allow connections from LAN

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Accessible on LAN at: http://10.0.1.117:${PORT}`);
});
