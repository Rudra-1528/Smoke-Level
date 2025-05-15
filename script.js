const ACCESS_TOKEN = "tVOHhSaOgXc8YMaKx6K9"; // Your ThingsBoard device token
const THRESHOLD = 400;

const client = mqtt.connect("wss://mqtt.thingsboard.cloud/mqtt", {
  username: ACCESS_TOKEN,
  keepalive: 60,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  clean: true,
});


const smokeDisplay = document.getElementById("smokeLevel");
const statusDisplay = document.getElementById("status");
const alertSound = document.getElementById("alertSound");

client.on("connect", () => {
  console.log("✅ Connected to ThingsBoard MQTT");
  client.subscribe("v1/devices/me/telemetry", err => {
    if (err) {
      console.error("❌ Subscription error:", err);
    } else {
      console.log("📡 Subscribed to telemetry");
    }
  });
});

client.on("message", (topic, message) => {
  console.log("🔔 MQTT message received");
  try {
    const payload = JSON.parse(message.toString());
    console.log("📨 Payload received:", payload);

    const smoke = payload.smoke;

    if (smoke !== undefined) {
      smokeDisplay.textContent = smoke;

      if (smoke > THRESHOLD) {
        statusDisplay.textContent = "⚠️ ALERT: High Smoke!";
        statusDisplay.classList.add("alert");
        alertSound.play().catch(err => console.warn("Audio play failed:", err));
      } else {
        statusDisplay.textContent = "✅ Air is Safe";
        statusDisplay.classList.remove("alert");
        alertSound.pause();
        alertSound.currentTime = 0;
      }
    } else {
      console.warn("⚠️ No 'smoke' field in payload");
    }
  } catch (err) {
    console.error("❌ Failed to parse MQTT message:", err);
  }
});
