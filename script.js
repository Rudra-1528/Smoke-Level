const ACCESS_TOKEN = "tVOHhSaOgXc8YMaKx6K9"; // Replace with your ThingsBoard device token
const THRESHOLD = 400;

const client = mqtt.connect("wss://mqtt.thingsboard.cloud:443/mqtt", {
  username: ACCESS_TOKEN
});

const smokeDisplay = document.getElementById("smokeLevel");
const statusDisplay = document.getElementById("status");
const alertSound = document.getElementById("alertSound");
const needle = document.getElementById("needle");

// Chart.js setup
const ctx = document.getElementById('smokeChart').getContext('2d');
const smokeData = {
  labels: [],
  datasets: [{
    label: 'Smoke Level',
    borderColor: '#00ffcc',
    data: [],
    tension: 0.3
  }]
};
const chart = new Chart(ctx, {
  type: 'line',
  data: smokeData,
  options: {
    responsive: true,
    scales: {
      x: { display: false },
      y: { min: 0, max: 1024 }
    }
  }
});

client.on("connect", () => {
  console.log("Connected to ThingsBoard MQTT");
  client.subscribe("v1/devices/me/telemetry");
});

client.on("message", (topic, message) => {
  const payload = JSON.parse(message.toString());
  console.log("Received payload:", payload); // 🔍 Debugging line

  // Use flexible field lookup
  const smoke = payload.smoke || payload.smokeLevel || payload.field1;

  if (smoke === undefined) {
    console.warn("No valid smoke field found in telemetry.");
    return;
  }

  smokeDisplay.textContent = smoke;
  updateGauge(smoke);
  updateChart(smoke);

  if (smoke > THRESHOLD) {
    statusDisplay.textContent = "⚠️ ALERT: High Smoke!";
    statusDisplay.classList.remove("safe");
    statusDisplay.classList.add("alert");
    alertSound.play();
  } else {
    statusDisplay.textContent = "✅ Air is Safe";
    statusDisplay.classList.remove("alert");
    statusDisplay.classList.add("safe");
    alertSound.pause();
    alertSound.currentTime = 0;
  }
});

function updateGauge(value) {
  const angle = Math.min(180, (value / 1024) * 180);
  needle.style.transform = `rotate(${angle}deg)`;
}

function updateChart(value) {
  const time = new Date().toLocaleTimeString();
  if (smokeData.labels.length > 20) {
    smokeData.labels.shift();
    smokeData.datasets[0].data.shift();
  }
  smokeData.labels.push(time);
  smokeData.datasets[0].data.push(value);
  chart.update();
}
