require('dotenv').config();

const { 
  GraphQLSchema, 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLInt, 
  GraphQLList, 
  GraphQLFloat 
} = require('graphql');
const axios = require('axios');
const { GraphQLJSON } = require('graphql-type-json');



const PORT = process.env.PORT || 5001;
const PP_API_URL = process.env.PP_API_URL;
const PLAYNGO_API_URL = process.env.PLAYNGO_API_URL;
const UNIBO_API_URL = process.env.UNIBO_API_URL;
const AMUSNET_API_URL = process.env.AMUSNET_API_URL;
const EGT_DIGITAL_API_URL = process.env.EGT_DIGITAL_API_URL;



// -----------------------
// Pragmatic Play Jackpot Types
// -----------------------

// Define Tier Type for PP jackpots
const JackpotTierType = new GraphQLObjectType({
  name: 'JackpotTier',
  fields: {
    jackpotTierID: { type: GraphQLInt },
    tier: { type: GraphQLInt },
    amount: { type: GraphQLFloat }
  }
});

// Define Jackpot Type for PP jackpots
const JackpotType = new GraphQLObjectType({
  name: 'Jackpot',
  fields: {
    mainJackpotID: { type: GraphQLInt },
    name: { type: GraphQLString },
    level: { type: GraphQLString },
    games: { type: GraphQLString },
    status: { type: GraphQLString },
    tiersNumber: { type: GraphQLInt },
    tiers: { type: new GraphQLList(JackpotTierType) }
  }
});

// -----------------------
// Play'n GO Jackpot Types
// -----------------------

// For Play'n GO we want to return a flattened structure for each tier.
// This type returns a single tier entry.
const PlayngoJackpotType = new GraphQLObjectType({
  name: 'PlayngoJackpot',
  fields: {
    JackpotId: { type: GraphQLInt },
    BaseAmount: { type: GraphQLFloat },
    NumPayouts: { type: GraphQLInt }
  }
});

// -----------------------
// Root Query Definition
// -----------------------

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // PP jackpots query
    pragmaticJackpots: {
      type: new GraphQLList(JackpotType),
      resolve: async () => {
        try {
          const response = await axios.get(PP_API_URL);
          if (response.data.error !== "0") {
            throw new Error("API Error: " + response.data.description);
          }
          return response.data.jackpots;
        } catch (error) {
          console.error("Error fetching PP jackpots:", error.message);
          throw new Error("Failed to fetch PP jackpots");
        }
      }
    },
    // Play'n GO jackpots query
    playngoJackpots: {
      type: new GraphQLList(PlayngoJackpotType),
      resolve: async () => {
        try {
          const response = await axios.get(PLAYNGO_API_URL);
          
          // Check for an error field (if it exists)
          if (response.data.error && response.data.error !== "0") {
            throw new Error("API Error: " + response.data.description);
          }
          
          // Determine the jackpots array from the response.
          let jackpotsData;
          if (Array.isArray(response.data)) {
            jackpotsData = response.data;
          } else if (Array.isArray(response.data.jackpots)) {
            jackpotsData = response.data.jackpots;
          } else {
            jackpotsData = [];
          }
          
          // For Play'n GO, if the jackpot object includes tiers, flatten them.
          // Otherwise, map directly.
          const jackpots = jackpotsData.flatMap(jackpot => {
            if (jackpot.tiers && Array.isArray(jackpot.tiers)) {
              return jackpot.tiers.map(tier => ({
                // Use either mainJackpotID or JackpotId depending on the API structure.
                JackpotId: jackpot.mainJackpotID || jackpot.JackpotId,
                BaseAmount: tier.amount,
                // If NumPayouts is not present, default to 0.
                NumPayouts: jackpot.NumPayouts || 0
              }));
            } else {
              return {
                JackpotId: jackpot.JackpotId,
                BaseAmount: jackpot.BaseAmount,
                NumPayouts: jackpot.NumPayouts
              };
            }
          });
          
          return jackpots;
        } catch (error) {
          console.error("Error fetching Play'n GO jackpots:", error.message);
          throw new Error("Failed to fetch Play'n GO jackpots");
        }
      }
    },
    // -----------------------
    // Unibo campaigns query (added separately)
    // -----------------------
    uniboCampaigns: {
      type: GraphQLJSON,
      resolve: async () => {
        try {
          const response = await axios.request({
            url: UNIBO_API_URL,
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // Replace with your actual token.
            }
          });
          return response.data;
        } catch (error) {
          console.error("Error fetching Unibo campaigns:", error.message);
          throw new Error("Failed to fetch Unibo campaigns");
        }
      }
    },

      // -----------------------
    // Amusnet jackpots query
    // -----------------------
    amusnetJackpots: {
      type: GraphQLJSON,
      resolve: async () => {
        try {
          const response = await axios.request({
            url: AMUSNET_API_URL,
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // Replace with your actual token.
            }
          });
          return response.data;
        } catch (error) {
          console.error("Error fetching Amusnet jackpots:", error.message);
          throw new Error("Failed to fetch Amusnet jackpots");
        }
      }
    },
          // -----------------------
    // Amusnet jackpots query
    // -----------------------
    egtDigitalJackpots: {
      type: GraphQLJSON,
      resolve: async () => {
        try {
          const response = await axios.request({
            url: EGT_DIGITAL_API_URL,
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // Replace with your actual token.
            }
          });
          return response.data;
        } catch (error) {
          console.error("Error fetching Amusnet jackpots:", error.message);
          throw new Error("Failed to fetch Amusnet jackpots");
        }
      }
    }
    
  }
});



// -----------------------
// Export Schema
// -----------------------

module.exports = new GraphQLSchema({
  query: RootQuery
});
