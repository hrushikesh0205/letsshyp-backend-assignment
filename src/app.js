const express = require("express");
const app = express();

const couriers = require("./data/couriers");
const orders = require("./data/orders");
const calculateDistance = require("./utils/distance");
const canTransition = require("./utils/stateMachine");

app.use(express.json());

// BASIC ROUTES 

app.get("/", (req, res) => {
  res.send("Lets Shyp Backend is Running");
});

app.get("/couriers", (req, res) => {
  res.json(couriers);
});

// CREATE ORDER 

app.post("/orders", (req, res) => {
  const { pickup, drop, deliveryType } = req.body;

  if (!pickup || !drop || !deliveryType) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  const newOrder = {
    id: `O${orders.length + 1}`,
    pickup,
    drop,
    deliveryType,
    status: "CREATED",
    courierId: null,
  };

  let nearestCourier = null;
  let minDistance = Infinity;

  for (let courier of couriers) {
    if (!courier.available) continue;

    const distance = calculateDistance(courier.location, pickup);

    if (deliveryType === "EXPRESS" && distance > 5) continue;

    if (distance < minDistance) {
      minDistance = distance;
      nearestCourier = courier;
    }
  }

  if (nearestCourier) {
    nearestCourier.available = false;
    newOrder.courierId = nearestCourier.id;
    newOrder.status = "ASSIGNED";
  }

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// UPDATE ORDER STATUS 

app.post("/orders/:id/status", (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (!canTransition(order.status, status)) {
    return res.status(400).json({
      error: `Invalid transition from ${order.status} to ${status}`,
    });
  }

  order.status = status;
  // Free courier after delivery
if (status === "DELIVERED" && order.courierId) {
  const courier = couriers.find(c => c.id === order.courierId);
  if (courier) courier.available = true;
}
  res.json(order);

});

//SERVER START 

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

app.get("/orders", (req, res) => {
  res.json(orders);
});

app.post("/orders/:id/cancel", (req, res) => {
  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.status === "DELIVERED") {
    return res.status(400).json({
      error: "Cannot cancel a delivered order",
    });
  }

  order.status = "CANCELLED";

  // Free courier if assigned
  if (order.courierId) {
    const courier = couriers.find(c => c.id === order.courierId);
    if (courier) courier.available = true;
  }

  res.json(order);
});


