#include <ArduinoJson.h>// ibörjan vilka biblotek som ska avändas i koden
#define D7 13
#include <ESP8266WiFi.h>          //https://github.com/esp8266/Arduino //needed for library
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>//https://github.com/tzapu/WiFiManager
int AI_ljus = 0;//variabler för att kunna ta in värden från sensorn
int ljus =0;
String Lampname = "lampa";

 String SendtoDB(String host){
 String type ="PATCH ";
 String url= "/grupp3/"; //Urlen jag använder för att posta mina värden
  Serial.println("Skickar värde första gången");
  StaticJsonBuffer<300> jsonBuffer; //Skapar en buffer, det vill säga så mycket minne som vårt blivande jsonobjekt får använda.
  JsonObject& root = jsonBuffer.createObject(); //Skapar ett jsonobjekt som vi kallar root
  root["brightness"] = ljus; // nivån av ljus
  root["name"] = Lampname; //Skapar parameterna name och ger den värdet Lampname
  String buffer; //Skapar en string som vi kallar buffer
  root.printTo(buffer); //Lägger över och konverterar vårt jsonobjekt till en string och sparar det i buffer variabeln.
    //här någonstans ska jag anvädna POST eller PATCH beroende på om värdet finns!!!!
    // Detta skickar värdena till servern.
  String Output =type+url + " HTTP/1.1\r\n" + //Säger att det är typen post, kan vara patch, get,delete beroende på vad man vill göra., samt urlen vi ska till.
  "Host: " + host+ "\r\n" + //Berättar vilken host det är vi ansluter till
  "Content-Type: application/json\r\n" + //Säger att det är Json format vi skickar (dock konverterat till en string för att kunna skickas.
  "Content-Length: " + buffer.length() + "\r\n" + //Berättar hur stort packet vi ska skicka.
  "\r\n" + // Detta är en extra radbrytning för att berätta att det är här bodyn startar.
  buffer + "\n"; //skickar vår buffer som body
  Serial.println(Output);
  return Output;
}

void ConnecttoDB(String input){
 const int httpPort = 3001; //porten vi ska till
 const char* host = "iot.abbindustrigymnasium.se";//Adressen vi ska ansluta, datorns ip

 Serial.print("connecting to ");
Serial.println(host); //Skriver ut i terminalen för att veta vart vi ska skicka värdena.

 WiFiClient client;
 if (!client.connect(host, httpPort)) { //Försöker ansluta
 Serial.println("connection failed");
 return;
 }
 else //Om vi kan ansluta så ska lampa lysa
 {
 digitalWrite(13, HIGH);
 }
  Serial.println(input);
client.print(SendtoDB(host));
 unsigned long timeout = millis();
 while (client.available() == 0) {
 if (millis() - timeout > 10000) {// om servern inte svarar på en viss tid så ska allt avbrytas
 Serial.println(">>> Client Timeout !");
 client.stop();
 return;
 }
 }
}

 void setup() {
  pinMode(13, OUTPUT); //här startas alla funktioner för att man senare ska kunna referera till dem
    Serial.begin(115200);

    //WiFiManager
    //Local intialization. Once its business is done, there is no need to keep it around
    WiFiManager wifiManager;
    //reset saved settings
    //wifiManager.resetSettings();
    
    wifiManager.autoConnect("Oliver...");
    //if you get here you have connected to the WiFi
    Serial.println("connected...yeey :)");
}


void loop() {
  delay(1000);
  ljus = analogRead(AI_ljus);// det ända som görs här är att vi tar värdet från sensorn och skickar det till databasen
  ConnecttoDB("Send");
}
