require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

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
  console.log("login", req.body);
  try {
    const response = await axios.post(
      "https://api.leapwork.dev/leapwork-tracker-dev/LoginUser",
      req.body,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": "d083be5bb7434be39303042ac886a032",
        },
        withCredentials: true,
      }
    );

    const { accessToken, refreshToken } = response.data;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true, // use true in production (HTTPS)
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({
      status: 200,
      message: "Login successful",
      ...response.data,
    });
  } catch (error) {
    console.error("Error authenticating user:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to authenticate user",
      details: error.message,
    });
  }
});

app.get("/profile", async (req, res) => {
  try {
    console.log("Access Token:", req.cookies);
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res.status(401).json({ error: "No access token" });
    }

    // Call Azure profile API with token
    const response = await axios.get(
      "https://api.leapwork.dev/leapwork-tracker-dev/Profile",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Ocp-Apim-Subscription-Key": "d083be5bb7434be39303042ac886a032",
        },
      }
    );
    console.log("response.data", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch profile",
      details: error.message,
    });
  }
});

app.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token" });
    }

    // Call Azure refresh API
    const response = await axios.post(
      "https://api.leapwork.dev/leapwork-tracker-dev/RefreshToken",
      { refreshToken },
      {
        headers: {
          "Ocp-Apim-Subscription-Key": "d083be5bb7434be39303042ac886a032",
        },
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Update cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Tokens refreshed" });
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to refresh token",
      details: error.message,
    });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});
