// This #include statement was automatically added by the Particle IDE.
#include <SparkJson.h>

// This #include statement was automatically added by the Particle IDE.
#include <Stepper.h>

const int stepsPerRevolution = 150;
Stepper myStepper(stepsPerRevolution, 2,3,4,5);

long first = 0;
long interval = 30000;


int LED = D7;
int soil = A0;

int desired = 0;


String moisture = "0";
String name = "snap";

String eventname = "hook-response/name";

String data = "{ \"name\": \""+ name +"\", \"moisture\": " + moisture + "}"; 
//int soilMoisture[5] = {1000,2000,3000,4000, 5000};

int soilMoisture = 4095;

void setup() {
    Serial.begin(9600);
    
    pinMode(LED, OUTPUT);
    pinMode(soil, INPUT);
   // pinMode(solenoid, OUTPUT);
   // Particle.subscribe("hook-response/name", myHandler);
   // Particle.variable("k", soilMoisture[0]);
    
    Particle.subscribe("demo", testHandler);
   
  // put your setup code here, to run once:
  myStepper.setSpeed(60);
  // initialize the serial port:
  

}


void loop() {
    
    //Serial.print("goodness");
    
    soilMoisture = analogRead(soil);
    soilMoisture = 4095 - soilMoisture; //flip the scale so that it is more intuitive. 0 is driest, 4095 is wettest.
    // sensor calibration: after flipping, 0 is driest (OC) and submerged in water, sensor reads 3000.
    
    moisture = String(soilMoisture);
   
    data = "{ \"name\": \""+ name +"\", \"moisture\": " + moisture + "}"; 
     Particle.publish("name", data);  

    if(soilMoisture<desired)
    {
       connect();
    }
    
    delay(10000);
}

void testHandler(const char *event, const char *data)
{
    Serial.println(data);
    Serial.print("New data from user available.");
    delay(100);
    desired = atoi(data); //convert data to integer
   digitalWrite(LED, HIGH);
   delay(1000);
   digitalWrite(LED, LOW);
   
}

void connect()
{
  // step one revolution in the other direction:
  //Serial.println("counterclockwise");
  myStepper.step(-stepsPerRevolution);
  delay(200);
  
 //Serial.println("clockwise");
  myStepper.step(stepsPerRevolution);
  delay(200);

}