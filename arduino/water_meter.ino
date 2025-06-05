/*
 * Smart Water Meter - NodeMCU Code
 * 
 * This code reads water flow data from a YF-S201 flow sensor and sends it to a web server.
 * It works directly with the Smart Water Meter Django application.
 * 
 * Hardware:
 * - NodeMCU (ESP8266)
 * - YF-S201 Water Flow Sensor
 * - Optional: DS18B20 Temperature Sensor
 */

// Include required libraries
#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

// WiFi Configuration
const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";

// Server Configuration
const char* serverUrl = "http://your_server_ip/api/water-usage/";  // Full URL including http
const char* api_key = "your_api_key";

// Pin Definitions
const byte FLOW_SENSOR_PIN = D2;  // Flow sensor connected to D2 on NodeMCU
const byte TEMP_SENSOR_PIN = D4;  // DS18B20 data pin connected to D4

// Flow Sensor Calibration
const float calibrationFactor = 4.5;
volatile byte pulseCount = 0;
float flowRate = 0.0;
float flowMilliLitres = 0;
float totalMilliLitres = 0;
unsigned long oldTime = 0;

// Temperature Sensor Setup
OneWire oneWire(TEMP_SENSOR_PIN);
DallasTemperature sensors(&oneWire);

// Function prototypes
void IRAM_ATTR pulseCounter();
void sendDataToServer();

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Initialize flow sensor
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, FALLING);
  
  // Initialize temperature sensor
  sensors.begin();

  // Connect to WiFi
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  oldTime = millis();
}

void loop() {
  // Process flow data every second
  if ((millis() - oldTime) > 1000) {
    detachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN));

    flowRate = ((1000.0 / (millis() - oldTime)) * pulseCount) / calibrationFactor;
    flowMilliLitres = (flowRate / 60) * 1000;  // L/min to mL/s
    totalMilliLitres += flowMilliLitres;

    sensors.requestTemperatures();
    float temperature = sensors.getTempCByIndex(0);

    Serial.print("Flow rate: ");
    Serial.print(flowRate, 2);
    Serial.print(" L/min, Total: ");
    Serial.print(totalMilliLitres / 1000.0, 3);
    Serial.print(" L, Temp: ");
    Serial.print(temperature);
    Serial.println("°C");

    static unsigned long lastSend = 0;
    if (millis() - lastSend > 60000) {
      sendDataToServer();
      lastSend = millis();
    }

    pulseCount = 0;
    oldTime = millis();
    attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, FALLING);
  }
}

// Flow sensor ISR
void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

// Send data to Django server via API
void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Skipping send.");
    return;
  }

  if (flowRate < 0.01) {
    Serial.println("Flow rate too low. Skipping send.");
    return;
  }

  HTTPClient http;
  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);

  String payload = "{\"meter_id\":\"METER001\",\"volume\":\"";
  payload += String(totalMilliLitres / 1000.0, 3);
  payload += "\",\"flow_rate\":\"";
  payload += String(flowRate, 2);
  payload += "\",\"temperature\":\"";
  payload += String(temperature);
  payload += "\",\"api_key\":\"";
  payload += api_key;
  payload += "\"}";

  Serial.println("Sending data:");
  Serial.println(payload);

  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    Serial.print("HTTP Response: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.println("Response: " + response);
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}
