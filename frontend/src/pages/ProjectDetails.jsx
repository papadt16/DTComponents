import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../utils/api";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function ProjectDetails() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");

useEffect(() => {
  const data = projects[slug];
  if (data) {
    setProject(data);
  } else {
    setProject(null);
  }
}, [slug]);

  if (error) {
    return <p style={{ padding: 40 }}>{error}</p>;
  }

  if (!project) {
    return <p style={{ padding: 40 }}>Loading project...</p>;
  }

  return (
    <div style={page}>
      <h1 style={title}>{project.title}</h1>

      <Section title="Overview">
        <p>{project.overview}</p>
      </Section>

      <Section title="Key Features">
        <ul>
          {project.features?.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </Section>

      <Section title="Components Required">
        <ul>
          {project.components?.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </Section>

      <Section title="Schematic Diagram">
        <img src={project.schematic} alt="schematic" style={image} />
      </Section>

      <Section title="Source Code">
  <SyntaxHighlighter
    language="c"
    style={oneDark}
    customStyle={{
      borderRadius: "8px",
      fontSize: "14px",
      padding: "20px",
    }}
  >
    {project.code}
  </SyntaxHighlighter>
</Section>


     <Section title="Code Explanation">
  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
    {project.explanation.map((item, i) => (
      <div key={i}>
        <p style={{ fontSize: "16px", lineHeight: 1.7 }}>
          {item.text}
        </p>

        {item.image && (
          <img
            src={item.image}
            alt="explanation"
            style={{
              width: "100%",
              maxWidth: "500px",
              marginTop: "15px",
              borderRadius: "6px",
            }}
          />
        )}
      </div>
    ))}
  </div>
</Section>
    </div>
  );
}
 
const projects = {
  "smart-home-automation": {
    title: "Smart Home Automation",
    overview:
      "In this IoT project, I have shown how to make IoT based Smart Home Automation Using Blynk & ESP32 to control an 8-channel relay module from the manual switch & smartphone using the Blynk App. If the internet is not available, then you can control the home appliances from manual switches. During the article, I have shown all the steps to make this home automation system.",
    features: [
      "1. Control home appliances with WiFi (Blynk App)",

      "2. Control home appliances with manual switches.",

      "3. Monitor real-time feedback in the Blynk App.",

      "4. Control home appliances manually without internet.",

      "You need just an 8-channel relay module & ESP32 board to make this smart home project.",
    ],
    components: [
      "1. Relays 5v (SPDT) (8 no)",
      "2. BC547 Transistors (8 no)",
      "3. PC817 Optocuplors (8 no)",
      "4. 510-ohm 0.25-watt Resistor (8 no) (R1 - R8)",
      "5. 1k 0.25-watt Resistors (10 no) (R9 - R18)",
      "6. LED 5-mm (10 no)",
      "7. 1N4007 Diodes (8 no) (D1 - D8)",
      "8. Push Buttons (8 no)",
      "9. Terminal Connectors",
      "10. 5V DC supply",
    ],
    schematic:
      "https://content.instructables.com/FDR/A47B/KJEAG18Y/FDRA47BKJEAG18Y.jpg?auto=webp&frame=1&width=1024&height=1024&fit=bounds&md=MjAyMS0wMS0wMSAyMDowNDo0Ni4w",
    code: `
/**********************************************************************************
 *  TITLE: ESP32 Home Automation project using Blynk | Internet & Manual control with Realtime Feedback | 8-CHANNEL RELAY
 *  Click on the following links to learn more. 
 *  YouTube Video: https://youtu.be/o1e5s_5p3FU
 *  Related Blog : https://iotcircuithub.com/blynk-esp32-home-automation/
 *  by Tech StudyCell
 **********************************************************************************/
/*************************************************************
  Update the Preferences –> Aditional boards Manager URLs: 
  https://dl.espressif.com/dl/package_esp32_index.json, http://arduino.esp8266.com/stable/package_esp8266com_index.json
  
  Note: This requires ESP32 support package:
    https://github.com/espressif/arduino-esp32
    
  Download latest Blynk library here:
    https://github.com/blynkkk/blynk-library/releases/latest

 *************************************************************
  
  Change WiFi ssid, pass, and Blynk auth token to run :)
  
  Please be sure to select the right ESP32 module
  in the Tools -> Board menu!

 *************************************************************/

#include <BlynkSimpleEsp32.h>

BlynkTimer timer;

// define the GPIO connected with Relays and switches
#define RelayPin1 23  //D23
#define RelayPin2 22  //D22
#define RelayPin3 21  //D21
#define RelayPin4 19  //D19
#define RelayPin5 18  //D18
#define RelayPin6 5   //D5
#define RelayPin7 25  //D25
#define RelayPin8 26  //D26

#define SwitchPin1 13  //D13
#define SwitchPin2 12  //D12
#define SwitchPin3 14  //D14
#define SwitchPin4 27  //D27
#define SwitchPin5 33  //D33
#define SwitchPin6 32  //D32
#define SwitchPin7 15  //D15
#define SwitchPin8 4   //D4

#define wifiLed    2   //D2

#define VPIN_BUTTON_1    V1 
#define VPIN_BUTTON_2    V2
#define VPIN_BUTTON_3    V3 
#define VPIN_BUTTON_4    V4
#define VPIN_BUTTON_5    V5 
#define VPIN_BUTTON_6    V6
#define VPIN_BUTTON_7    V7 
#define VPIN_BUTTON_8    V8

int toggleState_1 = 1; //Define integer to remember the toggle state for relay 1
int toggleState_2 = 1; //Define integer to remember the toggle state for relay 2
int toggleState_3 = 1; //Define integer to remember the toggle state for relay 3
int toggleState_4 = 1; //Define integer to remember the toggle state for relay 4
int toggleState_5 = 1; //Define integer to remember the toggle state for relay 5
int toggleState_6 = 1; //Define integer to remember the toggle state for relay 6
int toggleState_7 = 1; //Define integer to remember the toggle state for relay 7
int toggleState_8 = 1; //Define integer to remember the toggle state for relay 8

int wifiFlag = 0;

#define AUTH "AUTH TOKEN"                 // You should get Auth Token in the Blynk App.  
#define WIFI_SSID "WIFI NAME"             //Enter Wifi Name
#define WIFI_PASS "WIFI PASSWORD"         //Enter wifi Password


void relayOnOff(int relay){

    switch(relay){
      case 1: 
             if(toggleState_1 == 1){
              digitalWrite(RelayPin1, LOW); // turn on relay 1
              toggleState_1 = 0;
              Serial.println("Device1 ON");
              }
             else{
              digitalWrite(RelayPin1, HIGH); // turn off relay 1
              toggleState_1 = 1;
              Serial.println("Device1 OFF");
              }
             delay(100);
      break;
      case 2: 
             if(toggleState_2 == 1){
              digitalWrite(RelayPin2, LOW); // turn on relay 2
              toggleState_2 = 0;
              Serial.println("Device2 ON");
              }
             else{
              digitalWrite(RelayPin2, HIGH); // turn off relay 2
              toggleState_2 = 1;
              Serial.println("Device2 OFF");
              }
             delay(100);
      break;
      case 3: 
             if(toggleState_3 == 1){
              digitalWrite(RelayPin3, LOW); // turn on relay 3
              toggleState_3 = 0;
              Serial.println("Device3 ON");
              }
             else{
              digitalWrite(RelayPin3, HIGH); // turn off relay 3
              toggleState_3 = 1;
              Serial.println("Device3 OFF");
              }
             delay(100);
      break;
      case 4: 
             if(toggleState_4 == 1){
              digitalWrite(RelayPin4, LOW); // turn on relay 4
              toggleState_4 = 0;
              Serial.println("Device4 ON");
              }
             else{
              digitalWrite(RelayPin4, HIGH); // turn off relay 4
              toggleState_4 = 1;
              Serial.println("Device4 OFF");
              }
             delay(100);
      break;
      case 5: 
             if(toggleState_5 == 1){
              digitalWrite(RelayPin5, LOW); // turn on relay 5
              toggleState_5 = 0;
              Serial.println("Device5 ON");
              }
             else{
              digitalWrite(RelayPin5, HIGH); // turn off relay 5
              toggleState_5 = 1;
              Serial.println("Device5 OFF");
              }
             delay(100);
      break;
      case 6: 
             if(toggleState_6 == 1){
              digitalWrite(RelayPin6, LOW); // turn on relay 6
              toggleState_6 = 0;
              Serial.println("Device6 ON");
              }
             else{
              digitalWrite(RelayPin6, HIGH); // turn off relay 6
              toggleState_6 = 1;
              Serial.println("Device6 OFF");
              }
             delay(100);
      break;
      case 7: 
             if(toggleState_7 == 1){
              digitalWrite(RelayPin7, LOW); // turn on relay 7
              toggleState_7 = 0;
              Serial.println("Device7 ON");
              }
             else{
              digitalWrite(RelayPin7, HIGH); // turn off relay 7
              toggleState_7 = 1;
              Serial.println("Device7 OFF");
              }
             delay(100);
      break;
      case 8: 
             if(toggleState_8 == 1){
              digitalWrite(RelayPin8, LOW); // turn on relay 8
              toggleState_8 = 0;
              Serial.println("Device8 ON");
              }
             else{
              digitalWrite(RelayPin8, HIGH); // turn off relay 8
              toggleState_8 = 1;
              Serial.println("Device8 OFF");
              }
             delay(100);
      break;
      default : break;      
      }  
}

void with_internet(){
    //Manual Switch Control
    if (digitalRead(SwitchPin1) == LOW){
      delay(200);
      relayOnOff(1); 
      Blynk.virtualWrite(VPIN_BUTTON_1, toggleState_1);   // Update Button Widget  
    }
    else if (digitalRead(SwitchPin2) == LOW){
      delay(200);
      relayOnOff(2);      
      Blynk.virtualWrite(VPIN_BUTTON_2, toggleState_2);   // Update Button Widget
    }
    else if (digitalRead(SwitchPin3) == LOW){
      delay(200);
      relayOnOff(3);
      Blynk.virtualWrite(VPIN_BUTTON_3, toggleState_3);   // Update Button Widget
    }
    else if (digitalRead(SwitchPin4) == LOW){
      delay(200);
      relayOnOff(4);
      Blynk.virtualWrite(VPIN_BUTTON_4, toggleState_4);   // Update Button Widget
    }
    else if (digitalRead(SwitchPin5) == LOW){
      delay(200);
      relayOnOff(5); 
      Blynk.virtualWrite(VPIN_BUTTON_5, toggleState_5);   // Update Button Widget  
    }
    else if (digitalRead(SwitchPin6) == LOW){
      delay(200);
      relayOnOff(6);      
      Blynk.virtualWrite(VPIN_BUTTON_6, toggleState_6);   // Update Button Widget
    }
    else if (digitalRead(SwitchPin7) == LOW){
      delay(200);
      relayOnOff(7);
      Blynk.virtualWrite(VPIN_BUTTON_7, toggleState_7);   // Update Button Widget
    }
    else if (digitalRead(SwitchPin8) == LOW){
      delay(200);
      relayOnOff(8);
      Blynk.virtualWrite(VPIN_BUTTON_8, toggleState_8);   // Update Button Widget
    }
}
void without_internet(){
    //Manual Switch Control
    if (digitalRead(SwitchPin1) == LOW){
      delay(200);
      relayOnOff(1);      
    }
    else if (digitalRead(SwitchPin2) == LOW){
      delay(200);
      relayOnOff(2);
    }
    else if (digitalRead(SwitchPin3) == LOW){
      delay(200);
      relayOnOff(3);
    }
    else if (digitalRead(SwitchPin4) == LOW){
      delay(200);
      relayOnOff(4);
    }
    else if (digitalRead(SwitchPin5) == LOW){
      delay(200);
      relayOnOff(5);      
    }
    else if (digitalRead(SwitchPin6) == LOW){
      delay(200);
      relayOnOff(6);
    }
    else if (digitalRead(SwitchPin7) == LOW){
      delay(200);
      relayOnOff(7);
    }
    else if (digitalRead(SwitchPin8) == LOW){
      delay(200);
      relayOnOff(8);
    }
}

BLYNK_CONNECTED() {
  // Request the latest state from the server
  Blynk.syncVirtual(VPIN_BUTTON_1);
  Blynk.syncVirtual(VPIN_BUTTON_2);
  Blynk.syncVirtual(VPIN_BUTTON_3);
  Blynk.syncVirtual(VPIN_BUTTON_4);
  Blynk.syncVirtual(VPIN_BUTTON_5);
  Blynk.syncVirtual(VPIN_BUTTON_6);
  Blynk.syncVirtual(VPIN_BUTTON_7);
  Blynk.syncVirtual(VPIN_BUTTON_8);
}

// When App button is pushed - switch the state

BLYNK_WRITE(VPIN_BUTTON_1) {
  toggleState_1 = param.asInt();
  digitalWrite(RelayPin1, toggleState_1);
}

BLYNK_WRITE(VPIN_BUTTON_2) {
  toggleState_2 = param.asInt();
  digitalWrite(RelayPin2, toggleState_2);
}

BLYNK_WRITE(VPIN_BUTTON_3) {
  toggleState_3 = param.asInt();
  digitalWrite(RelayPin3, toggleState_3);
}

BLYNK_WRITE(VPIN_BUTTON_4) {
  toggleState_4 = param.asInt();
  digitalWrite(RelayPin4, toggleState_4);
}

BLYNK_WRITE(VPIN_BUTTON_5) {
  toggleState_5 = param.asInt();
  digitalWrite(RelayPin5, toggleState_5);
}

BLYNK_WRITE(VPIN_BUTTON_6) {
  toggleState_6 = param.asInt();
  digitalWrite(RelayPin6, toggleState_6);
}

BLYNK_WRITE(VPIN_BUTTON_7) {
  toggleState_7 = param.asInt();
  digitalWrite(RelayPin7, toggleState_7);
}

BLYNK_WRITE(VPIN_BUTTON_8) {
  toggleState_8 = param.asInt();
  digitalWrite(RelayPin8, toggleState_8);
}


void checkBlynkStatus() { // called every 3 seconds by SimpleTimer

  bool isconnected = Blynk.connected();
  if (isconnected == false) {
    wifiFlag = 1;
    digitalWrite(wifiLed, LOW); //Turn off WiFi LED
  }
  if (isconnected == true) {
    wifiFlag = 0;
    digitalWrite(wifiLed, HIGH); //Turn on WiFi LED
  }
}
void setup()
{
  Serial.begin(9600);

  pinMode(RelayPin1, OUTPUT);
  pinMode(RelayPin2, OUTPUT);
  pinMode(RelayPin3, OUTPUT);
  pinMode(RelayPin4, OUTPUT);
  pinMode(RelayPin5, OUTPUT);
  pinMode(RelayPin6, OUTPUT);
  pinMode(RelayPin7, OUTPUT);
  pinMode(RelayPin8, OUTPUT);

  pinMode(wifiLed, OUTPUT);

  pinMode(SwitchPin1, INPUT_PULLUP);
  pinMode(SwitchPin2, INPUT_PULLUP);
  pinMode(SwitchPin3, INPUT_PULLUP);
  pinMode(SwitchPin4, INPUT_PULLUP);
  pinMode(SwitchPin5, INPUT_PULLUP);
  pinMode(SwitchPin6, INPUT_PULLUP);
  pinMode(SwitchPin7, INPUT_PULLUP);
  pinMode(SwitchPin8, INPUT_PULLUP);

  //During Starting all Relays should TURN OFF
  digitalWrite(RelayPin1, toggleState_1);
  digitalWrite(RelayPin2, toggleState_2);
  digitalWrite(RelayPin3, toggleState_3);
  digitalWrite(RelayPin4, toggleState_4);
  digitalWrite(RelayPin5, toggleState_5);
  digitalWrite(RelayPin6, toggleState_6);
  digitalWrite(RelayPin7, toggleState_7);
  digitalWrite(RelayPin8, toggleState_8);

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  timer.setInterval(3000L, checkBlynkStatus); // check if Blynk server is connected every 3 seconds
  Blynk.config(AUTH);
}

void loop()
{  
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("WiFi Not Connected");
  }
  else
  {
    Serial.println("WiFi Connected");
    Blynk.run();
  }

  timer.run(); // Initiates SimpleTimer
  if (wifiFlag == 0)
    with_internet();
  else
    without_internet();
}
`,
    explanation: [
      {"Step 1: Circuit Diagram of the ESP32 Project",
      
      "This is the complete circuit diagram for this home automation project. I have explained the circuit in the tutorial video.",
      "The circuit is very simple, I have used the GPIO pins D23, D22, D21, D19, D18, D5, D25 & D26 to control the 8 relays.",
      "And the GPIO pins D13, D12, D14, D27, D33, D32, D15 & D4 connected with push buttons to control the 8 relays manually.",
      "I have used the INPUT_PULLUP function in Arduino IDE instead of using the pull-up resistors.",
      "I have used a 5V mobile charger to supply the smart relay module.",
      },
      
      {"Step 2: Control Relays With Internet Using Blynk",
      
      "If the ESP32 module is connected with the WiFi, then you can control the home appliances from Blynk App and push-buttons. You can control, monitor the real-time status of the relays from anywhere in the world with the Blynk App.",
      },

      {"Step 3: Control Relays Without Internet Using Push-buttons",

      "If the WiFi is not available, you can control the relays from the pushbuttons.",

      "The ESP32 will check for the WiFi after every 3 seconds. When the WiFi is available, the ESP32 will automatically connect with the WiFi.",
      },
      
      {"Step 4: Configure the Blynk App for the ESP32",
      "https://content.instructables.com/FN2/L5IA/KJEAG18W/FN2L5IAKJEAG18W.jpg?auto=webp&frame=1&width=1024&height=1024&fit=bounds&md=MjAyMS0wMS0wMSAyMDowNDo0MS4w&_gl=1*3ddldx*_ga*MjA0MjU1MTc3Ni4xNzY2MTc3OTI1*_ga_NZSJ72N6RX*czE3NjYxNzc5MjckbzEkZzEkdDE3NjYxNzc5MjckajYwJGwwJGgw",
      "1. Install the Blynk App from the Google play store or App store. Then create an account and tap on the New Project.",

      "2. Give the name to the project, select ESP32 Dev Board, Connection type will be WiFi. Then tap on Create.",

      "3. Blynk will send an authentication token to the registered email id. Tap on OK.",
      },
      
      {"Step 5: Add the Button Widgets in Blynk App",
      "https://content.instructables.com/F9K/QW43/KJEAG18V/F9KQW43KJEAG18V.jpg?auto=webp&frame=1&width=1024&height=1024&fit=bounds&md=MjAyMS0wMS0wMSAyMDowNDozOC4w",
      "Then add 8 button widgets to control the 8 relays. Here I have used virtual pins V1, V2, V3, V4, V5, V6, V7, V8 for 8 buttons. And mode will be Switch.",
      },
      
      {"Step 6: Code for Blynk ESP32 Home Automation",
      "https://content.instructables.com/FQ0/733Z/KJEAG19R/FQ0733ZKJEAG19R.jpg?auto=webp&frame=1&crop=3:2&width=800&fit=bounds&md=MjAyMS0wMS0wMSAyMDowNToxNi4w",
      "Before uploading the code you have to install the ESP32 board and Blynk library.",

      "Then enter the WiFi name, WiFi password & Blynk Auth Token in the code.",

      "Select the DOIT ESP32 DEVKIT V1 board and proper PORT.",

      "Then upload the code to ESP32 Board.",
      },
    ],
  },
};

/* ===== REUSABLE SECTION ===== */

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

/* ===== STYLES ===== */

const page = {
  padding: "50px",
  maxWidth: "900px",
  margin: "auto",
  color: "black",
};

const title = {
  fontSize: "36px",
  fontWeight: "bold",
};

const sectionTitle = {
  fontSize: "22px",
  marginBottom: 10,
  borderBottom: "2px solid #334155",
  paddingBottom: 6,
};

const image = {
  width: "100%",
  maxWidth: "600px",
  marginTop: 10,
};

const codeBox = {
  background: "#020617",
  padding: "20px",
  borderRadius: "8px",
  overflowX: "auto",
  fontSize: "14px",
};
