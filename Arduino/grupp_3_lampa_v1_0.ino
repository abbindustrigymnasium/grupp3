#include <ESP8266WiFi.h> 
#define Button 15// input on D8    
//Både ArduinoJson och Wifimanager måste installeras som bibliotek, de finns med i bibliotekskatalogen, tänk att ArduinoJSon versionen som ska väljas är 5.13 och inte senaste.     
#include <ArduinoJson.h> // V 5.13 inte 6! https://arduinojson.org/?utm_source=meta&utm_medium=library.properties
//needed for library
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>         //https://github.com/tzapu/WiFiManager
#define D7 13 // SPI Bus MOSI
#define D6 12// alla define och include lägger till biblotek och förklarar vilka pins som ska aktiveras
volatile bool state = false;// en volatile data typ behövs för att man ska kunna ändra värdet i en interrupt funktion
void setup() {
   attachInterrupt(digitalPinToInterrupt(Button), Change, RISING );// förklarar att när strömen ökar i inputs pin:en(man trycker på knappen) så ska programmet pausas och Change funktionen ska på börjas
      pinMode(Button,INPUT);//Declare The Button as an Input  
      pinMode(13, OUTPUT); //Declare GPIO13 as output
      pinMode(12, OUTPUT); 
    // put your setup code here, to run once:
    Serial.begin(115200);
  //Från Wifimanagers hemsida.
    //WiFiManager
    //Local intialization. Once its business is done, there is no need to keep it around
    WiFiManager wifiManager;
    //reset saved settings
    //wifiManager.resetSettings();
    wifiManager.autoConnect("Connecttor");
    //or use this for auto generated name ESP + ChipID
    //wifiManager.autoConnect();

    //if you get here you have connected to the WiFi
    Serial.println("connected...yeey :)");

}
 volatile bool ButtonPress = false;// ett värde som säger om knappen har blivit tryck eller inte
 String Lampname= "lampa"; //Lampans namn
 int Tempvalue=0; // kallt/varmt
 int Strengthvalue= 0; //Styrkan
 int OnOffvalue = 0;// på eller av
 bool LampExist=false; //Finns lampan redan eller är den ny?
 bool GottenValues = false; //Har vi hämtat några värden redan från databasen?
String GetfromDB(String host){
String url= "/grupp3/"+Lampname; //Urlen jag använder för att posta mina värden
  // Detta skickar värdena till servern.
   String Output ="GET "+ url + " HTTP/1.1\r\n" + //Säger att det är typen post, kan vara patch, get,delete beroende på vad man vill göra., samt urlen vi ska till.
                 "Host: " + host+ "\r\n" + //Berättar vilken host det är vi ansluter till
                 "\r\nConnection: close\r\n\r\n"; //skickar vår buffer som  body
 return Output;
}

String SendtoDB(String host){
  String type ="PATCH";
  String url= "/grupp3/"; //Urlen jag använder för att posta mina värden
   
  StaticJsonBuffer<300> jsonBuffer; //Skapar en buffer, det vill säga så mycket minne som vårt blivande jsonobjekt får använda.
  JsonObject& root = jsonBuffer.createObject(); //Skapar ett jsonobjekt som vi kallar root
  root["name"] = Lampname; //Skapar parameterna name och ger den värdet Vykort
  root["onoroff"] = OnOffvalue;
  String buffer;  //Skapar en string som vi kallar buffer
  root.printTo(buffer); //Lägger över och konverterar vårt jsonobjekt till en string och sparar det i buffer variabeln.
  type ="PATCH ";
      Serial.println("Uppdaterar värdet!");
//här någonstans ska jag anvädna POST eller PATCH beroende på om värdet finns!!!!
  // Detta skickar värdena till servern.
   String Output =type+url + " HTTP/1.1\r\n" + //Säger att det är typen post, kan vara patch, get,delete beroende på vad man vill göra., samt urlen vi ska till.
                 "Host: " + host+ "\r\n" + //Berättar vilken host det är vi ansluter till
                 "Content-Type: application/json\r\n" + //Säger att det är Json format vi skickar (dock konverterat till en string för att kunna skickas.
                 "Content-Length: " + buffer.length() + "\r\n" + //Berättar hur stort packet vi ska skicka.
                 "\r\n" + // Detta är en extra radbrytning för att berätta att det är här bodyn startar.
                 buffer + "\n"; //skickar vår buffer som  body
 
 return Output;
}

void ConnecttoDB(String input){

   const int httpPort = 3000; //porten vi ska till
  const char* host = "iot.abbindustrigymnasium.se";//Adressen vi ska ansluta till. 7Laddaremygglustbil "http://iot.abbindustrigymnasium.se"
    
     Serial.print("connecting to ");
 Serial.println(host); //Skriver ut i terminalen för att veta vart vi ska skicka värdena.
  
  // Use WiFiClient class to create TCP connections
  WiFiClient client;
  if (!client.connect(host, httpPort)) { //Försöker ansluta
    Serial.println("connection failed");
    return;
  }
  else  //Om vi kan ansluta så ska lampa lysa
  {
    //digitalWrite(13, HIGH);
    }
if(input =="GET")
client.print(GetfromDB(host));
else
client.print(SendtoDB(host));

  unsigned long timeout = millis();
  while (client.available() == 0) {
    if (millis() - timeout > 10000) {
      Serial.println(">>> Client Timeout !");
      client.stop();// om backend inte svarar inom 10 sec så kommer den sluta förrsöka att conecta
      return;
    }
  }

String json = ""; //De delarna vi vill ha ut av meddelandet sparar vi i stringen json
boolean httpBody = false; //bool för att säa att vi har kommit ner till bodydelen
// tittar om vi har anslutit till clienten
while (client.available()) {
  String line = client.readStringUntil('\r'); //Läser varje rad tills det är slut på rader
  if (!httpBody && line.charAt(1) == '{') { //Om vi hittar { så vet vi att vi har nått bodyn
    httpBody = true; //boolen blir true för att vi ska veta för nästa rad att vi redan är i bodyn
  }
  if (httpBody) { //Om bodyn är sann lägg till raden i json variabeln
    json += line;
  }
}
//Skriver ut bodyns data
    Serial.println("Got data:");
    Serial.println(json);
  if(input =="GET") //Om det är Get så kör vi metoden UpdateValues
    UpdateValues(json);

  Serial.println();
  Serial.println("closing connection");
}

void UpdateValues(String json){
    //Vi skapar ett Jsonobjekt där vi klistrar in värdena från bodyn
    StaticJsonBuffer<400> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(json);
    //Vi skapar sedan lokala strings där vi lägger över värdena en i taget
    String dataL = root["name"];
    if(dataL!="none")
    {
      int datat = root["temperature"];
      int datas = root["strength"];
      int datao = root["onoroff"];
      //Därefter skriver vi över de lokala värdena till våra globala värden för lampan
      Lampname = dataL; 
      Tempvalue =datat;
      Strengthvalue = datas;
      OnOffvalue = datao;
      LampExist=true;
      Serial.print(Strengthvalue);
   }
   else
   {
    String Mess =root["message"];
    Serial.print(Mess);
   }
   GottenValues = true;
}

void UpdatingLamp(){
  Serial.println(OnOffvalue);
  Serial.println(Strengthvalue);
  Serial.println(Tempvalue);// här printas alla värden
  int Strength = OnOffvalue * Strengthvalue;// här kollar programmet om lampan ska va på eller inte efter som den tar styrkan gånger antingen 0 eller 1 beroende på värdet på OnOff
  if (Tempvalue == 0){// här har vi de olika lägena som kan lysa
    analogWrite(12, Strength);
    analogWrite(13, LOW);
  } else if (Tempvalue == 1){
    analogWrite(13, Strength);
    analogWrite(12, LOW);
  } else if (Tempvalue == 2){
    analogWrite(13, Strength);
    analogWrite(12, Strength);
  }
}
void Change(){// här har vi en interuppt funktion som aktiveras när man trycker på knappen
  Serial.println("knapp tryck");
  state = !state;// eftersom den pausar allt så får denna funktion inte ta för lång tid så ändrar den bara två värden väldigt snabbt 
    ButtonPress = true;
  Serial.println(state);// den printar för lättare fel sökning
  }
void loop() {
  for(int x =0; x < 5; x++){// anledningen att ha en for loop här är så att man ska kunna bryta i från den utifall knappen trycks
     ConnecttoDB("GET");
    if(ButtonPress == true){
      break;
    } 
    if(ButtonPress == true){// om knappen trycks så ska på av värdet uppdateras som denna if sats gör
      if(state == true){//den här funktionen testar om knappen har tryckts nyligen eller inte
        OnOffvalue = 1;
      }
      else if (state ==false){
        OnOffvalue = 0;  
      } 
      UpdatingLamp();// de nya värdena uppdateras och skickas till databasen
      ConnecttoDB("POST");
      ButtonPress = false;
    } 
    UpdatingLamp();// en till updata behövs eftersom  de kan ha kommit in nya värden från andra källor
    if(ButtonPress == true){
      break;
    }
    delay(250);
  }
 if(ButtonPress == true){// här kollar  vi efter for loopen så att värdena värkligen uppdateras eftersom det skedde vissa buggar utan
      if(state == true){
        OnOffvalue = 1;
      }
      else if (state ==false){
        OnOffvalue = 0;  
      } 
      UpdatingLamp();
      ConnecttoDB("POST");
      ButtonPress = false;
    } 
}
