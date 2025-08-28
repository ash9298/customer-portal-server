const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");

app.use(cors());

const API_KEY = "9rI7UTw5.0i8CMpYCbDyrKi8x4rhuV0jC9CSAIpYa";
const commonHeaders = {
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
};

app.get("/all_licenses", async (req, res) => {
  try {
    const response = await axios.get(
      "https://saas.licensespring.com/api/v1/licenses/",
      {
        headers: {
          ...commonHeaders,
        },
        params: {
          order_by: "-created_at",
          limit: 1000,
          customer__reference__icontains: "qa@leapwork.com",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching licenses:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch licenses from the external API",
      details: error.message,
    });
  }
});

app.get("/check_customer", async (req, res) => {
  try {
    const response = await axios.get(
      "https://saas.licensespring.com/api/v1/customers/",
      {
        headers: {
          ...commonHeaders,
        },
        params: {
          reference: "qa@leapwork.com",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error check customer:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch customer from the external API",
      details: error.message,
    });
  }
});

app.get("/machine_info", async (req, res) => {
  try {
    const response = await axios.get(
      `https://saas.licensespring.com/api/v1/devices/${req.query.device_id}/`,
      {
        headers: {
          ...commonHeaders,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error check machine infor:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch machine info from the external API",
      details: error.message,
    });
  }
});

app.get("/product_info", async (req, res) => {
  try {
    const response = await axios.get(
      `https://saas.licensespring.com/api/v1/products/${req.query.product_id}/`,
      {
        headers: {
          ...commonHeaders,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching product info:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch product info from the external API",
      details: error.message,
    });
  }
});

app.use("/test", (req, res) => {
  res.send("Welcome to server");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
