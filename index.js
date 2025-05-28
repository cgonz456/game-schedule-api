const express = require('express');
const cors = require('cors');

const app = express();

// Allow requests from your Shopify domain (or * for all origins during dev)
app.use(cors({
  origin: 'https://nwmfc.com'  // replace with your Shopify domain
}));

// Your existing routes here

app.get('/api/next-games', (req, res) => {
  // your logic to get games
  res.json({ message: "Men: May 30 vs Lions | Women: May 31 vs Eagles" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
