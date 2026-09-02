// Seeds (or updates) the 8 Featured Builds shown on the homepage and at
// /projects/:slug. Safe to re-run — it upserts by slug, so it won't
// duplicate existing entries or touch any other project an admin has
// added through the admin panel.
//
// Usage (from the backend/ folder):
//   MONGO_URI="your-real-connection-string" node scripts/seed-projects.js
//
// Or, if you already have a local .env with MONGO_URI in it:
//   export $(grep -v '^#' .env | xargs) && node scripts/seed-projects.js

import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  overview: String,
  features: [String],
  components: [String],
  schematic: String,
  image: String,
  difficulty: String,
  code: String,
  explanation: [
    {
      title: String,
      text: mongoose.Schema.Types.Mixed,
      img: String,
    },
  ],
});

const Project = mongoose.model("Project", ProjectSchema, "projects");

const projects = [
  // ============================================================
  // 1. SMART HOME AUTOMATION
  // ============================================================
  {
    title: "Smart Home Automation",
    slug: "smart-home-automation",
    image: "/project-art/smart-home-automation.svg",
    difficulty: "Beginner",
    overview:
      "An IoT-based smart home automation system using Blynk & ESP32 to control an 8-channel relay module from both a manual switch and a smartphone. If the internet is unavailable, appliances can still be controlled from the manual switches — the system never fully depends on connectivity.",
    features: [
      "Control home appliances with WiFi via the Blynk App",
      "Control home appliances with manual physical switches",
      "Monitor real-time relay feedback in the Blynk App",
      "Full manual control without internet, as a fallback",
      "Just an 8-channel relay module & ESP32 board to get started",
    ],
    components: [
      "Relays 5V (SPDT) (8 no)",
      "BC547 Transistors (8 no)",
      "PC817 Optocouplers (8 no)",
      "510-ohm 0.25W Resistors (8 no)",
      "1k 0.25W Resistors (10 no)",
      "5mm LED (10 no)",
      "1N4007 Diodes (8 no)",
      "Push Buttons (8 no)",
      "Terminal Connectors",
      "5V DC Power Supply",
      "ESP32 DevKit V1",
    ],
    schematic: "/project-art/smart-home-automation.svg",
    code: `#include <BlynkSimpleEsp32.h>

BlynkTimer timer;

// GPIO connected to relays and switches
#define RelayPin1 23
#define RelayPin2 22
#define RelayPin3 21
#define RelayPin4 19
#define RelayPin5 18
#define RelayPin6 5
#define RelayPin7 25
#define RelayPin8 26

#define SwitchPin1 13
#define SwitchPin2 12
#define SwitchPin3 14
#define SwitchPin4 27
#define SwitchPin5 33
#define SwitchPin6 32
#define SwitchPin7 15
#define SwitchPin8 4

#define wifiLed 2

#define AUTH "AUTH_TOKEN"
#define WIFI_SSID "WIFI_NAME"
#define WIFI_PASS "WIFI_PASSWORD"

int toggleState[8] = {1,1,1,1,1,1,1,1};
int wifiFlag = 0;
int relayPins[8]  = {RelayPin1,RelayPin2,RelayPin3,RelayPin4,RelayPin5,RelayPin6,RelayPin7,RelayPin8};
int switchPins[8] = {SwitchPin1,SwitchPin2,SwitchPin3,SwitchPin4,SwitchPin5,SwitchPin6,SwitchPin7,SwitchPin8};

void relayOnOff(int i) {
  toggleState[i] = !toggleState[i];
  digitalWrite(relayPins[i], toggleState[i] ? LOW : HIGH);
  delay(100);
}

void checkManualSwitches() {
  for (int i = 0; i < 8; i++) {
    if (digitalRead(switchPins[i]) == LOW) {
      delay(200);
      relayOnOff(i);
      if (wifiFlag == 0) Blynk.virtualWrite(V1 + i, toggleState[i]);
    }
  }
}

BLYNK_CONNECTED() {
  for (int i = 0; i < 8; i++) Blynk.syncVirtual(V1 + i);
}

BLYNK_WRITE(V1) { toggleState[0] = param.asInt(); digitalWrite(RelayPin1, toggleState[0]); }
BLYNK_WRITE(V2) { toggleState[1] = param.asInt(); digitalWrite(RelayPin2, toggleState[1]); }
// ...repeat BLYNK_WRITE(V3..V8) the same way for relays 3-8

void checkBlynkStatus() {
  wifiFlag = Blynk.connected() ? 0 : 1;
  digitalWrite(wifiLed, wifiFlag ? LOW : HIGH);
}

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 8; i++) {
    pinMode(relayPins[i], OUTPUT);
    pinMode(switchPins[i], INPUT_PULLUP);
    digitalWrite(relayPins[i], toggleState[i]);
  }
  pinMode(wifiLed, OUTPUT);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  timer.setInterval(3000L, checkBlynkStatus);
  Blynk.config(AUTH);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) Blynk.run();
  timer.run();
  checkManualSwitches();
}
`,
    explanation: [
      {
        title: "Step 1: Wiring",
        text: [
          "GPIO 23, 22, 21, 19, 18, 5, 25 & 26 drive the 8 relay channels.",
          "GPIO 13, 12, 14, 27, 33, 32, 15 & 4 read the 8 manual push buttons, using INPUT_PULLUP instead of external pull-up resistors.",
          "A dedicated 5V supply powers the relay module — don't try to run 8 relays off the ESP32's onboard regulator.",
        ],
      },
      {
        title: "Step 2: Control with internet (Blynk)",
        text: "Once connected to WiFi, the appliance state can be toggled and monitored live from the Blynk App from anywhere, and the physical switches stay in sync with the app in both directions.",
      },
      {
        title: "Step 3: Control without internet",
        text: "If WiFi drops, the manual switches keep working exactly as before — the ESP32 checks for WiFi every 3 seconds in the background and reconnects automatically without interrupting local control.",
      },
    ],
  },

  // ============================================================
  // 2. IOT WEATHER STATION
  // ============================================================
  {
    title: "IoT Weather Station",
    slug: "iot-weather-station",
    image: "/project-art/iot-weather-station.svg",
    difficulty: "Beginner",
    overview:
      "A self-contained ESP32 weather station that reads temperature, humidity, and barometric pressure, shows current conditions on a local OLED display, and pushes readings to a web dashboard over WiFi every few minutes for historical tracking.",
    features: [
      "Live temperature, humidity, and pressure readings",
      "Local OLED readout — works even before the network connects",
      "Periodic upload to a web dashboard for historical charts",
      "Low-power friendly polling interval, adjustable in firmware",
      "Runs off a single 5V USB supply or battery bank",
    ],
    components: [
      "ESP32 DevKit V1",
      "DHT22 Temperature & Humidity Sensor",
      "0.96\" OLED Display SSD1306",
      "Breadboard 830 Point",
      "Jumper Wires (40pc M-M)",
      "5V 2A Power Adapter",
    ],
    schematic: "/project-art/iot-weather-station.svg",
    code: `#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

Adafruit_SSD1306 display(128, 64, &Wire, -1);

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* endpoint = "https://your-dashboard.example.com/api/weather";

const unsigned long UPLOAD_INTERVAL_MS = 5UL * 60UL * 1000UL; // 5 minutes
unsigned long lastUpload = 0;

void connectWiFi() {
  WiFi.begin(ssid, password);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 30) {
    delay(400);
    retries++;
  }
}

void showReading(float temp, float hum) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Weather Station");
  display.setTextSize(2);
  display.setCursor(0, 20);
  display.printf("%.1fC\\n", temp);
  display.setTextSize(1);
  display.setCursor(0, 46);
  display.printf("Humidity: %.0f%%", hum);
  display.display();
}

void uploadReading(float temp, float hum) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\\"temperature\\":" + String(temp, 1) +
                    ",\\"humidity\\":" + String(hum, 1) + "}";
  http.POST(payload);
  http.end();
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  Wire.begin();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  connectWiFi();
}

void loop() {
  float hum = dht.readHumidity();
  float temp = dht.readTemperature();

  if (!isnan(hum) && !isnan(temp)) {
    showReading(temp, hum);

    if (millis() - lastUpload >= UPLOAD_INTERVAL_MS) {
      uploadReading(temp, hum);
      lastUpload = millis();
    }
  }

  delay(2000); // DHT22 needs at least ~2s between reads
}
`,
    explanation: [
      {
        title: "Step 1: Sensor wiring",
        text: "DHT22 data pin goes to GPIO 4 with a 10k pull-up resistor to 3.3V (many breakout boards already include this). The OLED uses I2C — SDA/SCL to the ESP32's default I2C pins.",
      },
      {
        title: "Step 2: Local display first",
        text: "The OLED updates every loop regardless of WiFi status, so the station is useful as a standalone thermometer even if the network is down.",
      },
      {
        title: "Step 3: Periodic upload",
        text: "Readings are only POSTed to the dashboard every 5 minutes (not every loop) to avoid hammering the endpoint — adjust UPLOAD_INTERVAL_MS to taste.",
      },
    ],
  },

  // ============================================================
  // 3. LINE FOLLOWING ROBOT
  // ============================================================
  {
    title: "Line Following Robot",
    slug: "line-following-robot",
    image: "/project-art/line-following-robot.svg",
    difficulty: "Beginner",
    overview:
      "An Arduino-based robot that autonomously follows a dark line on a light surface (or vice versa) using a pair of IR reflectance sensors and a two-motor differential drive, correcting its path in real time as it drifts off-center.",
    features: [
      "Follows curves and gentle turns without manual input",
      "Corrective steering — proportional to how far off the line it drifts",
      "Runs entirely standalone on battery power, no host computer needed",
      "Simple two-sensor design, easy to extend to a 5-sensor array later",
    ],
    components: [
      "Arduino Uno R3",
      "IR Obstacle Sensor (2 no, used as line sensors)",
      "L298N Motor Driver IC",
      "DC Gear Motor 12V (2 no)",
      "Breadboard 830 Point",
      "Jumper Wires (40pc M-M)",
      "18650 Li-ion Battery (3.7V) (2 no)",
    ],
    schematic: "/project-art/line-following-robot.svg",
    code: `// Two-sensor line follower using an L298N motor driver

#define LEFT_SENSOR   2
#define RIGHT_SENSOR  3

#define ENA 5   // Left motor speed (PWM)
#define IN1 6
#define IN2 7
#define ENB 9   // Right motor speed (PWM)
#define IN3 10
#define IN4 11

const int BASE_SPEED = 150;   // 0-255
const int TURN_SPEED = 90;

void setMotors(int leftSpeed, int rightSpeed) {
  digitalWrite(IN1, leftSpeed >= 0 ? HIGH : LOW);
  digitalWrite(IN2, leftSpeed >= 0 ? LOW : HIGH);
  analogWrite(ENA, abs(leftSpeed));

  digitalWrite(IN3, rightSpeed >= 0 ? HIGH : LOW);
  digitalWrite(IN4, rightSpeed >= 0 ? LOW : HIGH);
  analogWrite(ENB, abs(rightSpeed));
}

void setup() {
  pinMode(LEFT_SENSOR, INPUT);
  pinMode(RIGHT_SENSOR, INPUT);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
}

void loop() {
  // LOW = sensor is over the dark line (typical IR reflectance module)
  bool leftOnLine  = digitalRead(LEFT_SENSOR) == LOW;
  bool rightOnLine = digitalRead(RIGHT_SENSOR) == LOW;

  if (leftOnLine && rightOnLine) {
    setMotors(BASE_SPEED, BASE_SPEED);       // straight
  } else if (leftOnLine && !rightOnLine) {
    setMotors(TURN_SPEED, BASE_SPEED);       // drifted right, correct left
  } else if (!leftOnLine && rightOnLine) {
    setMotors(BASE_SPEED, TURN_SPEED);       // drifted left, correct right
  } else {
    setMotors(BASE_SPEED, -BASE_SPEED);      // line lost, pivot to reacquire
  }
}
`,
    explanation: [
      {
        title: "Step 1: Sensor placement",
        text: "Mount both IR sensors on the underside of the chassis, close to the ground, straddling the width of the line so that under normal tracking both sensors sit just at its edges.",
      },
      {
        title: "Step 2: Motor driver wiring",
        text: "ENA/ENB carry PWM speed control, IN1-IN4 set direction. Power the L298N's motor supply separately from the Arduino's 5V — driving motors off the logic rail will brown out the board.",
      },
      {
        title: "Step 3: Tuning",
        text: "If the robot oscillates hard side-to-side, lower TURN_SPEED relative to BASE_SPEED. If it loses the line on tight curves, the sensors are likely spaced too far apart for the line's width.",
      },
    ],
  },

  // ============================================================
  // 4. SMART QUEUE MANAGEMENT
  // ============================================================
  {
    title: "Smart Queue Management",
    slug: "smart-queue-system",
    image: "/project-art/smart-queue-management.svg",
    difficulty: "Beginner",
    overview:
      "A token-based queue system for small service counters: customers press a button to take a numbered ticket shown on an LCD, staff advance the queue with a second button, and a buzzer gives audible feedback on each action — no app or internet connection required.",
    features: [
      "One-button ticket dispensing with instant LCD confirmation",
      "Staff-side 'next' button to advance the serving number",
      "Buzzer feedback distinguishes ticket-taken vs now-serving events",
      "Daily counter reset on power-up, or via a dedicated reset button",
    ],
    components: [
      "ESP32 DevKit V1",
      "16x2 LCD Display (I2C)",
      "Tactile Push Button (20pc) (2 used)",
      "Buzzer",
      "Breadboard 830 Point",
      "Jumper Wires (40pc M-M)",
    ],
    schematic: "/project-art/smart-queue-management.svg",
    code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

#define TICKET_BTN 14
#define NEXT_BTN   27
#define BUZZER     26

int ticketCount = 0;
int nowServing = 0;

void beep(int times, int ms) {
  for (int i = 0; i < times; i++) {
    digitalWrite(BUZZER, HIGH);
    delay(ms);
    digitalWrite(BUZZER, LOW);
    delay(ms);
  }
}

void updateDisplay() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Now Serving: ");
  lcd.print(nowServing);
  lcd.setCursor(0, 1);
  lcd.print("Waiting: ");
  lcd.print(max(0, ticketCount - nowServing));
}

void setup() {
  pinMode(TICKET_BTN, INPUT_PULLUP);
  pinMode(NEXT_BTN, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);

  lcd.init();
  lcd.backlight();
  updateDisplay();
}

void loop() {
  if (digitalRead(TICKET_BTN) == LOW) {
    delay(200); // debounce
    ticketCount++;
    beep(1, 100);
    updateDisplay();
  }

  if (digitalRead(NEXT_BTN) == LOW) {
    delay(200);
    if (nowServing < ticketCount) {
      nowServing++;
      beep(2, 80);
      updateDisplay();
    }
  }
}
`,
    explanation: [
      {
        title: "Step 1: Wiring",
        text: "The I2C LCD only needs SDA/SCL plus power — no data-bus wiring. Both buttons use INPUT_PULLUP so they read LOW when pressed, needing no external pull-up resistors.",
      },
      {
        title: "Step 2: Taking a ticket",
        text: "Pressing the customer-side button increments the ticket count and gives a single short beep — the LCD immediately shows the updated 'Waiting' count.",
      },
      {
        title: "Step 3: Serving the next customer",
        text: "Staff press the second button to advance 'Now Serving' by one, with a distinct double-beep so the two actions are never confused by sound alone.",
      },
    ],
  },

  // ============================================================
  // 5. SMART WASTE BIN
  // ============================================================
  {
    title: "Smart Waste Bin",
    slug: "smart-waste-bin",
    image: "/project-art/smart-waste-bin.svg",
    difficulty: "Advanced",
    overview:
      "An edge-AI waste sorting bin built on a Raspberry Pi 5, using an ESP32-CAM (streamed over a Pi-hosted local WiFi hotspot, no internet required) to classify waste as it's presented, ultrasonic sensors to track fill level, and a solenoid-locked compartment that only opens for the correctly sorted category.",
    features: [
      "On-device classification — no cloud dependency, works fully offline",
      "ESP32-CAM streams over a Pi-hosted hotspot for zero-internet operation",
      "Robust presence detection via OpenCV background subtraction (MOG2), resistant to lighting flicker false positives",
      "Fill-level monitoring with an ultrasonic sensor per compartment",
      "LCD status readout — waiting for camera, ready, bin full, sorting result",
      "Solenoid-locked compartment access — only unlocks for a valid, classified item",
    ],
    components: [
      "Raspberry Pi 5 (2GB) + active cooling case",
      "ESP32-CAM",
      "HC-SR04 Ultrasonic Sensor (2 no, one per compartment)",
      "16x2 LCD Display (I2C)",
      "5V 4-Channel Relay Module",
      "12V Solenoid Lock",
      "Bi-directional Logic Level Converter",
      "5V 2A Power Adapter (Pi) + 12V supply (solenoid)",
      "Buzzer",
      "MicroSD Card 16GB",
    ],
    schematic: "/project-art/smart-waste-bin.svg",
    code: `# smartbin_main.py — simplified control loop
# Runs on the Raspberry Pi. Pulls frames from the ESP32-CAM's local
# stream, uses background subtraction to detect a genuine object
# (not a lighting flicker), classifies it with a TFLite model, and
# actuates the matching compartment's solenoid lock.

import cv2
import time
import numpy as np
import RPi.GPIO as GPIO
from tflite_runtime.interpreter import Interpreter
from RPLCD.i2c import CharLCD

STREAM_URL = "http://192.168.4.2:81/stream"
MIN_OBJECT_AREA = 4000          # tune per camera distance/resolution
RELAY_PINS = {"organic": 17, "recyclable": 27}
FILL_TRIG, FILL_ECHO = 23, 24
FULL_THRESHOLD_CM = 8

lcd = CharLCD(i2c_expander="PCF8574", address=0x27)
interpreter = Interpreter(model_path="waste_classifier.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
LABELS = ["organic", "recyclable"]

GPIO.setmode(GPIO.BCM)
for pin in RELAY_PINS.values():
    GPIO.setup(pin, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(FILL_TRIG, GPIO.OUT)
GPIO.setup(FILL_ECHO, GPIO.IN)


def connect_stream():
    """Retries with gradually increasing backoff instead of crashing on
    the first failure — startup order between Pi and ESP32-CAM shouldn't
    matter."""
    delay = 5
    while True:
        cap = cv2.VideoCapture(STREAM_URL)
        if cap.isOpened():
            return cap
        lcd.clear()
        lcd.write_string("Waiting for\\nCamera...")
        time.sleep(delay)
        delay = min(delay + 1, 20)


def get_fill_distance_cm():
    GPIO.output(FILL_TRIG, False)
    time.sleep(0.0002)
    GPIO.output(FILL_TRIG, True)
    time.sleep(0.00001)
    GPIO.output(FILL_TRIG, False)

    start = time.time()
    while GPIO.input(FILL_ECHO) == 0:
        start = time.time()
    stop = start
    while GPIO.input(FILL_ECHO) == 1:
        stop = time.time()

    return (stop - start) * 34300 / 2


def classify(frame):
    img = cv2.resize(frame, (224, 224))
    img = np.expand_dims(img.astype(np.float32) / 255.0, axis=0)
    interpreter.set_tensor(input_details[0]["index"], img)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]["index"])[0]
    return LABELS[int(np.argmax(output))]


def unlock(category, seconds=3):
    pin = RELAY_PINS[category]
    GPIO.output(pin, GPIO.HIGH)
    time.sleep(seconds)
    GPIO.output(pin, GPIO.LOW)


def main():
    cap = connect_stream()
    lcd.clear()
    lcd.write_string("Smart Bin Ready")

    bg_subtractor = cv2.createBackgroundSubtractorMOG2(
        history=300, varThreshold=40, detectShadows=False
    )

    while True:
        if get_fill_distance_cm() < FULL_THRESHOLD_CM:
            lcd.clear()
            lcd.write_string("Bin Full")
            time.sleep(5)
            continue

        ok, frame = cap.read()
        if not ok:
            cap = connect_stream()
            continue

        fg_mask = bg_subtractor.apply(frame)
        fg_mask = cv2.erode(fg_mask, None, iterations=2)
        fg_mask = cv2.dilate(fg_mask, None, iterations=2)
        contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        largest_area = max((cv2.contourArea(c) for c in contours), default=0)

        if largest_area > MIN_OBJECT_AREA:
            category = classify(frame)
            lcd.clear()
            lcd.write_string(f"Detected:\\n{category}")
            unlock(category)
            time.sleep(2)  # brief pause so the frame buffer clears before resuming

        time.sleep(0.1)


if __name__ == "__main__":
    main()
`,
    explanation: [
      {
        title: "Step 1: Local-only camera link",
        text: "The Pi hosts its own WiFi hotspot; the ESP32-CAM connects to it and streams over MJPEG. Nothing here depends on an internet connection, which matters for a bin that might sit somewhere with no reliable WiFi.",
      },
      {
        title: "Step 2: Why background subtraction, not frame-differencing",
        text: "Comparing every frame to one frozen 'empty' snapshot is fragile — a lighting flicker across the whole frame looks identical to an object appearing. MOG2 background subtraction instead builds a running statistical model of the background and only flags a genuine, large, contiguous blob of change as a real object.",
      },
      {
        title: "Step 3: Classification only runs on a real trigger",
        text: "The TFLite model only processes a frame once the background-subtraction step confirms something is actually present — this keeps the 2GB Pi's CPU load low, since it's not running inference on every single frame continuously.",
      },
      {
        title: "Step 4: Fail-safe camera connection",
        text: "If the camera isn't reachable on first boot, the script retries with increasing backoff instead of crashing — power-on order between the Pi and the ESP32-CAM doesn't matter.",
      },
    ],
  },

  // ============================================================
  // 6. IOT SEWAGE MONITORING SYSTEM
  // ============================================================
  {
    title: "IoT Sewage Monitoring System",
    slug: "iot-sewage-monitoring",
    image: "/project-art/iot-sewage-monitoring.svg",
    difficulty: "Advanced",
    overview:
      "A manhole-mounted monitoring node that tracks sewage fill level and combustible/toxic gas concentration, publishing live readings over MQTT to a web dashboard so municipal operators can spot overflow risk or dangerous gas buildup before it becomes a hazard — without anyone opening the manhole to check manually.",
    features: [
      "Real-time fill level via ultrasonic time-of-flight sensing",
      "Methane and general air-quality gas sensing (MQ-4 / MQ-135)",
      "Publishes structured JSON telemetry over MQTT (WiFi + broker)",
      "Automatic status classification — NORMAL / WARNING / CRITICAL",
      "Web dashboard with live gauges, historical chart, and an alerts log",
    ],
    components: [
      "ESP32 DevKit V1",
      "Ultrasonic Sensor HC-SR04",
      "MQ-2 Gas Sensor (used here for combustible/methane sensing)",
      "5V 2A Power Adapter",
      "Project Enclosure Box (small)",
      "Hookup Wire Roll (22AWG)",
    ],
    schematic: "/project-art/iot-sewage-monitoring.svg",
    code: `#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

const char* mqtt_server = "YOUR_HIVEMQ_HOST.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "YOUR_MQTT_USER";
const char* mqtt_pass = "YOUR_MQTT_PASSWORD";

const String NODE_ID = "Manhole_01";
const String STATUS_TOPIC = "sewage/" + NODE_ID + "/status";

#define TRIG_PIN 5
#define ECHO_PIN 18
#define METHANE_PIN 34   // analog input, via voltage divider

const float PIPE_DEPTH_CM = 150.0;   // empty-pipe distance from sensor to floor
const int WARNING_LEVEL_PCT = 60;
const int CRITICAL_LEVEL_PCT = 85;
const int WARNING_METHANE_PPM = 300;
const int CRITICAL_METHANE_PPM = 600;

WiFiClientSecure espClient;
PubSubClient client(espClient);

float getDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  return (duration * 0.034) / 2;
}

int readMethanePpm() {
  int raw = analogRead(METHANE_PIN); // 0-4095 on ESP32
  // Simplified linear placeholder — not a calibrated Rs/Ro curve.
  // Good enough for relative trend + threshold alerting, not lab accuracy.
  return map(raw, 0, 4095, 0, 1000);
}

String classifyStatus(int levelPct, int methanePpm) {
  if (levelPct >= CRITICAL_LEVEL_PCT || methanePpm >= CRITICAL_METHANE_PPM) return "CRITICAL";
  if (levelPct >= WARNING_LEVEL_PCT || methanePpm >= WARNING_METHANE_PPM) return "WARNING";
  return "NORMAL";
}

void connectMQTT() {
  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);

  WiFi.begin(ssid, password);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(400);
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    client.connect(NODE_ID.c_str(), mqtt_user, mqtt_pass);
  }
}

void publishTelemetry(int levelPct, int methanePpm, String status) {
  if (!client.connected()) connectMQTT();
  if (!client.connected()) return;

  String payload = "{\\"node_id\\":\\"" + NODE_ID + "\\","
                    "\\"level_pct\\":" + String(levelPct) + ","
                    "\\"methane_ppm\\":" + String(methanePpm) + ","
                    "\\"status\\":\\"" + status + "\\"}";

  client.publish(STATUS_TOPIC.c_str(), payload.c_str());
  client.loop();
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  connectMQTT();
}

void loop() {
  float distance = getDistanceCm();
  int levelPct = constrain(
    (int)(100.0 * (PIPE_DEPTH_CM - distance) / PIPE_DEPTH_CM), 0, 100
  );
  int methanePpm = readMethanePpm();
  String status = classifyStatus(levelPct, methanePpm);

  publishTelemetry(levelPct, methanePpm, status);
  Serial.printf("level: %d%%, methane: %d ppm, status: %s\\n",
                levelPct, methanePpm, status.c_str());

  delay(10000); // report every 10s
}
`,
    explanation: [
      {
        title: "Step 1: Fill level from a fixed mounting depth",
        text: "The ultrasonic sensor measures distance down to the surface below it. Since the empty-pipe distance (PIPE_DEPTH_CM) is fixed and known at install time, that raw distance converts directly to a 0-100% fill reading.",
      },
      {
        title: "Step 2: Gas reading is an honest placeholder",
        text: "The ppm conversion here is a simplified linear mapping from raw ADC value, not a calibrated Rs/Ro curve from the sensor's datasheet. It's good enough for trend detection and threshold alerting, but shouldn't be quoted as a precise concentration.",
      },
      {
        title: "Step 3: Status classification happens on-device",
        text: "The ESP32 decides NORMAL/WARNING/CRITICAL itself before publishing, so the dashboard doesn't need to duplicate threshold logic — it just displays whatever status string arrives.",
      },
      {
        title: "Step 4: MQTT over WebSocket-capable TLS port",
        text: "Port 8883 is used here for the ESP32's native MQTT client; a browser-based dashboard subscribing to the same broker needs the WebSocket port instead (typically 8884), since browsers can't open raw TCP sockets.",
      },
    ],
  },

  // ============================================================
  // 7. ESP32 PARKING SYSTEM (sensor-only, no CCTV/ANPR)
  // ============================================================
  {
    title: "ESP32 Parking System",
    slug: "esp32-parking-system",
    image: "/project-art/esp32-parking-system.svg",
    difficulty: "Intermediate",
    overview:
      "A battery-friendly, sensor-only parking bay monitor: an overhead-mounted ultrasonic sensor per bay detects whether a vehicle is present, and the ESP32 reports occupancy over MQTT to a web dashboard. Deep sleep between checks keeps power draw low, and state only gets published when it actually changes — not on every wake cycle.",
    features: [
      "Overhead ultrasonic mounting — no under-pavement sensor needed",
      "Deep sleep between reads for long battery life on a solar/battery node",
      "Publishes only on a state change, not every wake cycle — light on bandwidth and broker load",
      "Supports multiple bays per controller (3 shown, easily extended)",
      "Purely sensor-based occupancy — no camera or plate recognition involved",
    ],
    components: [
      "ESP32 DevKit V1 (1 per zone controller)",
      "Ultrasonic Sensor HC-SR04 (1 per bay)",
      "18650 Li-ion Battery (3.7V)",
      "Project Enclosure Box (small)",
      "Hookup Wire Roll (22AWG)",
    ],
    schematic: "/project-art/esp32-parking-system.svg",
    code: `#include <WiFi.h>
#include <PubSubClient.h>

// --- CONFIGURATION ---
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

const char* mqtt_server = "YOUR_HIVEMQ_HOST.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "YOUR_MQTT_USER";
const char* mqtt_pass = "YOUR_MQTT_PASSWORD";

// Controller & Slot IDs
const String DEVICE_ID = "PARKSYS_ZONE1";
String slotIDs[3] = {"SLOT_A1", "SLOT_A2", "SLOT_A3"};

const String STATUS_TOPIC = "parking/" + DEVICE_ID + "/status";

// Hardware Pins (Slot 1, Slot 2, Slot 3)
const int trigPins[3] = {5, 17, 4};
const int echoPins[3] = {18, 16, 2};

// --- SENSOR MOUNTING & THRESHOLD (overhead mount) ---
// Mounting height (sensor to empty bay floor): 145.8 in = 370.332 cm
const float MOUNTING_HEIGHT_CM = 370.332;

// A bay reads OCCUPIED once measured distance drops to 110 in (279.4 cm)
// or less — meaning something (a vehicle roof) is now closer to the
// sensor than the empty floor was.
const float OCCUPIED_THRESHOLD = 279.4; // cm

const uint64_t SLEEP_SECONDS = 5;

// RTC memory — survives deep sleep, remembers each bay's last state
RTC_DATA_ATTR bool lastStates[3] = {false, false, false};
RTC_DATA_ATTR int bootCount = 0;

WiFiClientSecure espClient;
PubSubClient client(espClient);

float getDistance(int trig, int echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long duration = pulseIn(echo, HIGH, 30000);
  return (duration * 0.034) / 2;
}

void connectAndPublish() {
  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);

  WiFi.begin(ssid, password);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 15) {
    delay(400);
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    if (client.connect(DEVICE_ID.c_str(), mqtt_user, mqtt_pass)) {
      String payload = "{\\"device_id\\":\\"" + DEVICE_ID + "\\", \\"slots\\":[";
      for (int i = 0; i < 3; i++) {
        payload += "{\\"slot_id\\":\\"" + slotIDs[i] + "\\", \\"status\\":\\"" +
                   (lastStates[i] ? "occupied" : "free") + "\\"}";
        if (i < 2) payload += ",";
      }
      payload += "]}";

      client.publish(STATUS_TOPIC.c_str(), payload.c_str());

      // Give MQTT a moment to actually push the message before sleeping
      unsigned long startTime = millis();
      while (millis() - startTime < 1000) {
        if (client.connected()) client.loop();
        delay(50);
      }
    }
  }
}

void setup() {
  bool anyChanged = false;
  bootCount++;

  for (int i = 0; i < 3; i++) {
    pinMode(trigPins[i], OUTPUT);
    pinMode(echoPins[i], INPUT);

    float dist = getDistance(trigPins[i], echoPins[i]);
    bool isOccupied = (dist > 0 && dist <= OCCUPIED_THRESHOLD);

    if (isOccupied != lastStates[i] || bootCount == 1) {
      anyChanged = true;
      lastStates[i] = isOccupied;
    }
  }

  if (anyChanged) {
    connectAndPublish();
  }

  esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}
`,
    explanation: [
      {
        title: "Step 1: Overhead mounting math",
        text: "With the sensor mounted 145.8 in above the empty bay floor, a vehicle parked underneath reduces that measured distance. The threshold (110 in / 279.4 cm) is the point at which 'something is under the sensor' becomes true.",
      },
      {
        title: "Step 2: Deep sleep between checks",
        text: "The ESP32 wakes every 5 seconds, checks all 3 bays, and only reconnects to WiFi/MQTT if a bay's state actually changed — otherwise it goes straight back to sleep, which is what makes this practical on battery power.",
      },
      {
        title: "Step 3: RTC memory across sleep cycles",
        text: "lastStates[] and bootCount live in RTC_DATA_ATTR memory, which survives deep sleep (unlike normal RAM), so the ESP32 always knows what it last reported without needing to re-publish unchanged state.",
      },
      {
        title: "Step 4: Sensor range limit",
        text: "The HC-SR04 is reliably accurate to about 400 cm — a 370.3 cm mounting height is close to that edge. Expect some read noise on the 'empty' state; add a small dead-zone around the threshold if bays flicker between free/occupied.",
      },
    ],
  },

  // ============================================================
  // 8. SOLAR-POWERED SMART IRRIGATION SYSTEM
  // ============================================================
  {
    title: "Solar-Powered Smart Irrigation",
    slug: "solar-smart-irrigation",
    image: "/project-art/solar-smart-irrigation.svg",
    difficulty: "Intermediate",
    overview:
      "A self-powered plant watering system that checks soil moisture and only runs the pump when the soil actually needs it — avoiding both drought stress and overwatering. A small solar panel and battery keep it running off-grid, which suits anything from a balcony planter to an outdoor garden bed.",
    features: [
      "Waters only when soil moisture drops below a set threshold",
      "Fully solar-powered — no mains outlet needed near the planter",
      "Configurable check interval to balance responsiveness vs. battery life",
      "Pump runs for a fixed burst, then re-checks moisture before running again",
    ],
    components: [
      "ESP32 DevKit V1",
      "Soil Moisture Sensor",
      "5V 1-Channel Relay Module",
      "Solar Panel 6V 1W",
      "18650 Li-ion Battery (3.7V)",
      "Screw Terminal Block 2-pin",
      "Hookup Wire Roll (22AWG)",
    ],
    schematic: "/project-art/solar-smart-irrigation.svg",
    code: `#include <esp_sleep.h>

#define MOISTURE_PIN 34   // analog input from soil moisture sensor
#define PUMP_RELAY_PIN 26

// Calibrate these two for your specific sensor + soil:
// dip the sensor in dry air for DRY_VALUE, in water for WET_VALUE.
const int DRY_VALUE = 3000;
const int WET_VALUE = 1200;

const int MOISTURE_THRESHOLD_PCT = 35; // water if below this
const int PUMP_RUN_SECONDS = 5;
const uint64_t CHECK_INTERVAL_SECONDS = 30UL * 60UL; // check every 30 min

int readMoisturePercent() {
  int raw = analogRead(MOISTURE_PIN);
  int pct = map(raw, DRY_VALUE, WET_VALUE, 0, 100);
  return constrain(pct, 0, 100);
}

void runPump(int seconds) {
  digitalWrite(PUMP_RELAY_PIN, HIGH);
  delay(seconds * 1000UL);
  digitalWrite(PUMP_RELAY_PIN, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, LOW);

  int moisture = readMoisturePercent();
  Serial.printf("Soil moisture: %d%%\\n", moisture);

  if (moisture < MOISTURE_THRESHOLD_PCT) {
    Serial.println("Below threshold — running pump");
    runPump(PUMP_RUN_SECONDS);

    // Re-check after the burst so we don't loop-flood the soil if the
    // sensor is slow to respond to newly-added water.
    delay(2000);
    Serial.printf("Post-water moisture: %d%%\\n", readMoisturePercent());
  } else {
    Serial.println("Moisture OK — skipping this cycle");
  }

  esp_sleep_enable_timer_wakeup(CHECK_INTERVAL_SECONDS * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}
`,
    explanation: [
      {
        title: "Step 1: Calibrate before relying on percentages",
        text: "Soil moisture sensors report a raw ADC value that varies noticeably between individual sensors. DRY_VALUE and WET_VALUE need a one-time calibration in your actual sensor and soil before the percentage numbers mean anything.",
      },
      {
        title: "Step 2: Deep sleep between checks",
        text: "The ESP32 wakes on a timer, checks moisture once, waters if needed, then sleeps again — this is what makes a small solar panel + 18650 battery combination viable, since the board spends almost all its time in near-zero-power deep sleep.",
      },
      {
        title: "Step 3: Fixed-burst watering, not continuous",
        text: "The pump runs for a set number of seconds rather than 'until moist', since capacitive soil sensors respond with some delay after water is added — running to a live threshold risks overwatering before the reading catches up.",
      },
    ],
  },
];

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dtcomponents";
  await mongoose.connect(uri);
  console.log(`Connected to ${uri}`);

  for (const p of projects) {
    await Project.findOneAndUpdate({ slug: p.slug }, p, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    console.log(`✓ ${p.title}`);
  }

  console.log(`\\nDone — ${projects.length} projects seeded/updated.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
