const ACCESS_TOKEN = "tVOHhSaOgXc8YMaKx6K9"; // Replace with your ThingsBoard device token
const THRESHOLD = 400;

const client = mqtt.connect("wss://mqtt.thingsboard.cloud:443/mqtt", {
  username: ACCESS_TOKEN
});

const smokeDisplay = document.getElementById("smokeLevel");
const statusDisplay = document.getElementById("status");
const alertSound = document.getElementById("alertSound");

client.on("connect", () => {
  console.log("Connected to ThingsBoard");
  client.subscribe("v1/devices/me/telemetry", err => {
    if (err) console.error("Subscription error", err);
  });
});

client.on("message", (topic, message) => {
  const payload = JSON.parse(message.toString());
  console.log("Received:", payload);

  const smoke = payload.smoke;

  smokeDisplay.textContent = smoke;

  if (smoke > THRESHOLD) {
    statusDisplay.textContent = "⚠️ ALERT: High Smoke!";
    statusDisplay.classList.remove("safe");
    statusDisplay.classList.add("alert");
    alertSound.play();
  } else {
    statusDisplay.textContent = "✅ Air is Safe";
    statusDisplay.classList.remove("alert");
    statusDisplay.classList.add("safe");
  }
});
