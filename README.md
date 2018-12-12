# Grupp3 - Lampprojekt
I denna repository finns all kod till vårt lampprojekt. Vi har skapat en app som kommunicerar med backend och sedan skickar och hämtar värden i en databas. Sedan kan vår arduino hämta värden från databasen och justera sin ljusstyrka, varm eller kallt mm. På arduinon har vi också en ljussensor som detekterar ljusstyrkan ute och skickar det till databasen. Detta för att kunna stänga av lampan när det är för ljust ute.

## Frontend

Component 1 - Allt det som användaren ser. Kommunicerar med backend för att skicka och hämta värden.

Screen 1 - Visar Component 1

Ladda ner hela frontend mappen för att kunna testa den. Öppna appen med en Code Editor. Skriv sedan "npm install" i terminalen för att ladda ner alla "node modules". Ladda också ner "expo" genom att skriva "npm install expo". Skriv sedan "npm start" och skanna QR-koden genom din "expo" app.

## Backend

Backend.js - Hanterar post, patch och get. Kommunicerar med databasen genom SQL-kod.

Ladda ner hela Backend mappen för att kunna testa den. Öppna den via en Code editor. Skriv "npm install" i terminalen för att installera "node modules". När allt är nedladdat så skriver du "npm start" för att starta backenden.

## Arduino

ArduinoLampa - Hanterar lampan. Ökar eller sänker ljusstyrkan beroende på vad databasen innehåller. Ändrar av / på, varmt / kallt / båda.

ArduinoLjussensor - Hanterar ljussensor. Läser av ljuset ute och skickar det till databasen varje sekund.

Ladda ner båda filerna för att testa dem. Koppla sedan in din arduino och uploada koden.
