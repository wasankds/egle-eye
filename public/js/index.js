const socket = io(); 
const temp = document.getElementById("temp"); 
const hum = document.getElementById("hum"); 
const status = document.getElementById("status"); 

// Client connected to server
socket.on("connect", () => { 
  status.textContent = "✅ Connected"; 
  socket.emit("request_data");
});

// Client disconnected
socket.on("disconnect", () => { 
  status.textContent = "❌ Disconnected";
}); 

// Receive sensor data from server
socket.on("sensor_data", (data) => { 
  temp.textContent = data.temperature.toFixed(1); 
  hum.textContent = data.humidity.toFixed(1);
  console.log("📊 Data received:", data);
}); 

setInterval(() => { 
  if (socket.connected) socket.emit("request_data") 
}, 5000);