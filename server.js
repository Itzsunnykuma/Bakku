const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order (₹49)
app.post("/create-order", async (req, res) => {
    const options = {
        amount: 49 * 100,
        currency: "INR",
        receipt: "receipt_" + Date.now()
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
});

// Verify payment signature
app.post("/verify-payment", (req, res) => {
    const { order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        return res.json({ success: true });
    } else {
        return res.json({ success: false });
    }
});

app.get("/", (req, res) => res.send("Backend running!"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server started on port " + port));
