require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");

app.use(cors());
app.use(express.json());

const LicenseSpring_API_KEY = process.env.LS_API_KEY;
const commonHeaders = {
  Authorization: `Api-Key ${LicenseSpring_API_KEY}`,
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

app.post("/signup", async (req, res) => {
  console.log(req);
  try {
    const response = await axios.post(
      "https://api.leapwork.dev/leapwork-tracker-dev/SignupUser",
      req.body,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": "d083be5bb7434be39303042ac886a032",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error saving user:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to save user to db",
      details: error.message,
    });
  }
});

app.post("/login", async (req, res) => {
  console.log(req);
  try {
    const response = await axios.post(
      "https://api.leapwork.dev/leapwork-tracker-dev/LoginUser",
      req.body,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": "d083be5bb7434be39303042ac886a032",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error authenticating user:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to authenticate user",
      details: error.message,
    });
  }
});
