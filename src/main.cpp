#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include "LittleFS.h"
#include <Arduino_JSON.h>
#include "DHT.h"
#include <Wire.h>
#include <Adafruit_Sensor.h>

// Replace with your network credentials
const char *ssid = "CLB PIONEER";
const char *password = "c121bkdn";

// define pin
const int pin_humTempAirSensor = 2; // D4
const int pin_soilMoistureSensor = A0;
const int pin_lightSensor = 13; // D7 ok
const int pin_roofMotor1 = 12;  // D6
const int pin_roofMotor2 = 14;  // D5
const int pin_dewMotor = 4;     // D2
const int pin_lightRelay = 5;   // D1

// value sensor
int value_soiMoisture = 0;
int value_lightSensor = 0;
int value_humAir = 0;
int value_tempAir = 0;
DHT dht(pin_humTempAirSensor, DHT11);
bool state_Light = 0;
bool state_pumpDew = 0;
bool state_roof = 0;

// value auto
int value_auto_humSoil = 40;
int value_auto_humAir = 70;
int value_auto_tempAir = 30;
int value_auto_light = 50;

bool state_auto = 0;
//
bool roof = 0;
unsigned long previousMillis = 0;
unsigned long currentMillis;
const long interval = 14600;

unsigned long previousMillis1 = 0;
unsigned long currentMillis1;
const long interval1 = 2000;
// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
// Create a WebSocket object

AsyncWebSocket ws("/ws");

String message = "";

// Json Variable to Hold Slider Values
JSONVar stringValues;
void notifyClients(String sliderValues)
{
    ws.textAll(sliderValues);
}
// Get Slider Values
String getSliderValues()
{
    stringValues["value_soiMoisture"] = String(value_soiMoisture);
    stringValues["value_humAir"] = String(value_humAir);
    stringValues["value_tempAir"] = String(value_tempAir);
    stringValues["value_lightSensor"] = String(value_lightSensor);

    stringValues["state_light"] = String(state_Light);
    stringValues["state_pumpDew"] = String(state_pumpDew);
    stringValues["state_roof"] = String(state_roof);

    stringValues["auto_value_soiMoisture"] = String(value_auto_humSoil);
    stringValues["auto_value_humAir"] = String(value_auto_humAir);
    stringValues["auto_value_tempAir"] = String(value_auto_tempAir);
    stringValues["auto_value_lightSensor"] = String(value_auto_light);

    stringValues["auto_state"] = String(state_auto);
    stringValues["roof"] = String(roof);

    String jsonString = JSON.stringify(stringValues);
    return jsonString;
}

//

void turn_off_light()
{
    digitalWrite(pin_lightRelay, LOW);
    state_Light = 0;
}
void turn_on_light()
{
    digitalWrite(pin_lightRelay, HIGH);
    state_Light = 1;
}
void turn_off_pump()
{
    digitalWrite(pin_dewMotor, LOW);
    state_pumpDew = 0;
}
void turn_on_pump()
{
    digitalWrite(pin_dewMotor, HIGH);
    state_pumpDew = 1;
}
void turn_on_roof()
{
    currentMillis = millis();
    if (roof)
    {
        digitalWrite(pin_roofMotor1, HIGH);
        digitalWrite(pin_roofMotor2, LOW);
        if (currentMillis - previousMillis >= interval)
        {
            previousMillis = currentMillis;
            digitalWrite(pin_roofMotor1, LOW);
            digitalWrite(pin_roofMotor2, LOW);
            roof = 0;
            // notifyClients(getSliderValues());
            JSONVar temp;
            temp["roof"] = String(roof);
            notifyClients(JSON.stringify(temp));
        }
    }
    else
        previousMillis = currentMillis;

    state_roof = 1;
}
void turn_off_roof()
{
    currentMillis = millis();
    if (roof)
    {
        digitalWrite(pin_roofMotor1, LOW);
        digitalWrite(pin_roofMotor2, HIGH);
        if (currentMillis - previousMillis >= interval)
        {
            previousMillis = currentMillis;
            digitalWrite(pin_roofMotor1, LOW);
            digitalWrite(pin_roofMotor2, LOW);
            roof = 0;
            // notifyClients(getSliderValues());
            JSONVar temp;
            temp["roof"] = String(roof);
            notifyClients(JSON.stringify(temp));
        }
    }
    else
        previousMillis = currentMillis;

    state_roof = 0;
}
void hum_temp_air()
{
    value_tempAir = dht.readTemperature();
    value_humAir = dht.readHumidity();
}
void hum_soil()
{
    int value = analogRead(pin_soilMoistureSensor);
    int percent = map(value, 350, 1023, 0, 100);
    percent = 100 - percent;
    value_soiMoisture = percent;
}
void light()
{
    value_lightSensor = digitalRead(pin_lightSensor);
}

// Initialize LittleFS
void initFS()
{
    if (!LittleFS.begin())
    {
        Serial.println("An error has occurred while mounting LittleFS");
    }
    else
    {
        Serial.println("LittleFS mounted successfully");
    }
}

// Initialize WiFi
void initWiFi()
{
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi ..");
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print('.');
        delay(1000);
    }
    Serial.println(WiFi.localIP());
}

// sua
void handleWebSocketMessage(void *arg, uint8_t *data, size_t len)
{
    AwsFrameInfo *info = (AwsFrameInfo *)arg;
    if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT)
    {
        data[len] = 0;
        message = (char *)data;
        if (message.indexOf("1s") >= 0)
        {
            previousMillis1 = currentMillis1;
            String temp = message.substring(2);
            value_auto_humSoil = temp.toInt();
            // notifyClients(getSliderValues());
            JSONVar tempp;
            tempp["auto_value_soiMoisture"] = String(value_auto_humSoil);
            notifyClients(JSON.stringify(tempp));
        }
        if (message.indexOf("2s") >= 0)
        {
            previousMillis1 = currentMillis1;

            String temp = message.substring(2);
            value_auto_humAir = temp.toInt();
            // notifyClients(getSliderValues());
            JSONVar tempp;
            tempp["auto_value_humAir"] = String(value_auto_humAir);
            notifyClients(JSON.stringify(tempp));
        }
        if (message.indexOf("3s") >= 0)
        {
            previousMillis1 = currentMillis1;

            String temp = message.substring(2);
            value_auto_tempAir = temp.toInt();
            // notifyClients(getSliderValues());
            JSONVar tempp;
            tempp["auto_value_tempAir"] = String(value_auto_tempAir);
            notifyClients(JSON.stringify(tempp));
        }
        if (message.indexOf("4s") >= 0)
        {
            previousMillis1 = currentMillis1;

            String temp = message.substring(2);
            value_auto_light = temp.toInt();
            // notifyClients(getSliderValues());
            JSONVar tempp;
            tempp["auto_value_lightSensor"] = String(value_auto_light);
            notifyClients(JSON.stringify(tempp));
        }
        if (message.indexOf("button0") >= 0)
        {
            previousMillis1 = currentMillis1;

            if (state_auto)
                state_auto = 0;
            else
                state_auto = 1;
            // notifyClients(getSliderValues());
            JSONVar tempp;
            tempp["auto_state"] = String(state_auto);
            notifyClients(JSON.stringify(tempp));
        }
        // if (message.indexOf("button1") >= 0)
        // {
        //     if (state_Light)
        //         state_Light = 0;
        //     else
        //         state_Light = 1;
        // notifyClients(getSliderValues());
        // }
        if (message.indexOf("button2on") >= 0)
        {
            previousMillis1 = currentMillis1;

            state_pumpDew = 1;
            // notifyClients(getSliderValues());
            JSONVar tempp;
            tempp["state_pumpDew"] = String(state_pumpDew);
            notifyClients(JSON.stringify(tempp));
        }
        if (message.indexOf("button2off") >= 0)
        {
            previousMillis1 = currentMillis1;

            state_pumpDew = 0;
            // notifyClients(getSliderValues());
            JSONVar tempp;
            tempp["state_pumpDew"] = String(state_pumpDew);
            notifyClients(JSON.stringify(tempp));
        }
        if (message.indexOf("button3on") >= 0)
        {
            previousMillis1 = currentMillis1;

            state_roof = 1;
            roof = 1;
            previousMillis = currentMillis;
            // notifyClients(getSliderValues());
            JSONVar tempp;
            tempp["state_roof"] = String(state_roof);
            notifyClients(JSON.stringify(tempp));
        }
        if (message.indexOf("button3off") >= 0)
        {
            previousMillis1 = currentMillis1;

            state_roof = 0;
            roof = 1;
            previousMillis = currentMillis;
            // notifyClients(getSliderValues());
            JSONVar tempp;
            tempp["state_roof"] = String(state_roof);
            notifyClients(JSON.stringify(tempp));
        }
        if (message.indexOf("button4on") >= 0)
        {
            previousMillis1 = currentMillis1;

            state_Light = 1;
            // notifyClients(getSliderValues());
            JSONVar tempp;
            tempp["state_light"] = String(state_Light);
            notifyClients(JSON.stringify(tempp));
        }
        if (message.indexOf("button4off") >= 0)
        {
            previousMillis1 = currentMillis1;

            state_Light = 0;
            // notifyClients(getSliderValues());
            JSONVar tempp;
            tempp["state_light"] = String(state_Light);
            notifyClients(JSON.stringify(tempp));
        }
        if (strcmp((char *)data, "getValues") == 0)
        {
            notifyClients(getSliderValues());
        }
    }
}
void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len)
{
    switch (type)
    {
    case WS_EVT_CONNECT:
        Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
        break;
    case WS_EVT_DISCONNECT:
        Serial.printf("WebSocket client #%u disconnected\n", client->id());
        break;
    case WS_EVT_DATA:
        handleWebSocketMessage(arg, data, len);
        break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
        break;
    }
}

void initWebSocket()
{
    ws.onEvent(onEvent);
    server.addHandler(&ws);
}
void setup()
{
    Serial.begin(115200);
    pinMode(pin_soilMoistureSensor, INPUT);
    pinMode(pin_lightSensor, INPUT);
    pinMode(pin_roofMotor1, OUTPUT);
    pinMode(pin_roofMotor2, OUTPUT);
    pinMode(pin_dewMotor, OUTPUT);
    pinMode(pin_lightRelay, OUTPUT);
    dht.begin();
    initFS();
    initWiFi();

    //
    turn_off_light();
    turn_off_pump();
    turn_off_roof();
    // //

    initWebSocket();

    // Web Server Root URL
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(LittleFS, "/index.html", "text/html"); });

    // server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
    //           { request->send(SPIFFS, "/index.html"); });
    server.on("/temperature", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send_P(200, "text/plain", String(value_tempAir).c_str()); });
    server.on("/humAir", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send_P(200, "text/plain", String(value_humAir).c_str()); });
    server.on("/humSoil", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send_P(200, "text/plain", String(value_soiMoisture).c_str()); });
    server.on("/light", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send_P(200, "text/plain", String(value_lightSensor).c_str()); });
    server.serveStatic("/", LittleFS, "/");

    // Start server
    server.begin();
}

void loop()
{

    if (state_roof)
        turn_on_roof();
    else
        turn_off_roof();
    if (state_Light)
        turn_on_light();
    else
        turn_off_light();
    if (state_pumpDew)
        turn_on_pump();
    else
        turn_off_pump();
    currentMillis1 = millis();
    if (currentMillis1 - previousMillis1 >= interval1)
    {
        hum_temp_air();
        hum_soil();
        light();
        notifyClients(getSliderValues());
        previousMillis1 = currentMillis1;
    }

    // Serial.print("Temperature in C:");
    // Serial.println(value_tempAir);
    // Serial.print("Humidity in C:");
    // Serial.println(value_humAir);
    // Serial.print("hum soil:");
    // Serial.println(value_soiMoisture);
    // Serial.print("anh sang:");
    // Serial.println(value_lightSensor);
    // Serial.println(state_Light);
    // delay(1000);

    ws.cleanupClients();
}
