import datetime, json, redis, time
from pseudoSensor import PseudoSensor
from statistics import mean


class SensorApp():

    def __init__(self, *args, **kwargs):
        self.__db = redis.Redis(host=args[1], port=args[2], db=args[3])    
        # Init PseudoSensor for readouts
        self.ps = PseudoSensor()
        
        # Init App Vars
        self.__serialNumber = args[0]
        self.n = 10 # Number of iterations for generating multiple values
        self.nStats = 10 # Number of latest readouts to use for calculating min/max/avg
        self.nGraph = 48 # Number of latest readouts to plot on the graphs
        self.__history = []

        # Init Sensor Vars
        self.currentTemperature = 0
        self.__currentUnit = "F"
        self.currentHumidity = 0
        self.minTemperature = 60
        self.maxTemperature = 80
        self.minHumidity = 20
        self.maxHumidity = 50

        # Init Stats Vars
        self.statMinTemp = None
        self.statMaxTemp = None
        self.statAvgTemp = None
        self.statMinRHum = None
        self.statMaxRHum = None
        self.statAvgRHum = None
        self.statsCalculated = False
        self.sparklinesGraphed = False
    
    # Administrative Methods
    def getSerialNumber(self):
        return self.__serialNumber
    
    def handleCommand(self, command):
        print(f"::::: handleCommand :: {command}")
        match command:
            case "resetKey":
                deleted = self.deleteHistory()
                response = {
                    "error": deleted,
                    "data": {
                        "message": "Error: History was not deleted.",
                    }
                }
                if deleted == 0: 
                    response["data"]["message"] = "History deleted."
    
            case "generate1":
                response = self.getReadout()
                
            case "generateN":
                response = self.getNReadouts()

            case _:
                print("No valid command received")
                response = { 
                    "error": 1, 
                    "data": {
                        "message": "Invalid Command"
                    }
                 }
        return response    
    
    # History Methods
    def getHistory(self):
        return self.__history
    
    def deleteHistory(self):
        print(f"deleteHistory called")
        sn = self.__serialNumber
        self.__db.delete(sn)
        self.__history = self.__db.smembers(sn)
        print(f"S/N {sn} history cleared from app: {self.__history} and DB: {self.__db.smembers(sn)}")
        return len(self.__history)
    
    def updateHistory(self, readout):
        print(f"updateHistory called")
        sn = self.__serialNumber
        db = self.__db
        db.sadd(sn, json.dumps(readout))
        self.__history = db.smembers(sn)
        print(f"history updated, new length: {len(self.__history)}")

    # Sensor Reading Methods
    def getReadout(self):
        readout = self.generateReadout()
        response = {
            "error": 0,
            "data": {
                "message": "Readout updated.",
                "readout": readout,
                "unit": self.__currentUnit
            }
        }
        self.updateHistory(readout)
        return response
    
    def getNReadouts(self):
        print(f"getNReadouts called")
        response = {}
        for i in range(self.n):
            print(f"Getting readout #{i+1}")
            readout = self.getReadout()
            print(f"{i}: Sleep for 1 second.")
            time.sleep(1)
            print(f"{i}: Sleep done. :: {i == self.n - 1}")
            if (i == self.n - 1):
                print(f"{i}: Final readout, update response")
                response = readout
                print(f"Response :: {response}")

        print(f"getNReadouts finished, returning final readout :: {response}")
        return response

    # Pseudosensor - Generates a readout
    def generateReadout(self):
        h,t = self.ps.generate_values()
        currentTime = datetime.datetime.now()

        readout = {
            "temp":t,
            "rhum":h,
            # "timestamp": currentTime
            "timestamp": currentTime.timestamp(),
        }

        return readout
            

    # Temperature Conversion Methods
    def convertCurrentTemperature(self):
        print(f"convertTemperature called to convert {self.currentTemperature}°{self.currentUnit}")
        if self.currentUnit == "F":
            self.currentTemperature = round(self.convertTemperature(self.currentTemperature, "C"))
            if self.statsCalculated:
                self.statMinTemp = round(self.convertTemperature(self.statMinTemp,"C"))
                self.statMaxTemp = round(self.convertTemperature(self.statMaxTemp,"C"))
                self.statAvgTemp = round(self.convertTemperature(self.statAvgTemp,"C"))
                self.temperatureStats.setText(f"Min: {self.statMinTemp} / Max: {self.statMaxTemp} / Avg: {self.statAvgTemp}")
            self.currentUnit = "C"
            
            self.btnConvertTemperature.setText("Convert to °F")
        else:
            self.currentTemperature = round(self.convertTemperature(self.currentTemperature, "F"))
            if self.statsCalculated:
                self.statMinTemp = round(self.convertTemperature(self.statMinTemp,"F"))
                self.statMaxTemp = round(self.convertTemperature(self.statMaxTemp,"F"))
                self.statAvgTemp = round(self.convertTemperature(self.statAvgTemp,"F"))
                self.temperatureStats.setText(f"Min: {self.statMinTemp} / Max: {self.statMaxTemp} / Avg: {self.statAvgTemp}")
            self.currentUnit = "F"
            self.btnConvertTemperature.setText("Convert to °C")
        print(f"= {self.currentTemperature}°{self.currentUnit}")
        self.temperatureLabel.setText(f"{self.currentTemperature}")
        self.temperatureDegreeSymbol.setText(f"°{self.currentUnit}")
        print("convertTemperature complete")

    def convertTemperature(degrees, toUnit):
        if toUnit == "C":
            return (degrees - 32) * 5 / 9
        elif toUnit == "F":
            return (degrees * 9 / 5) + 32
        else: return degrees
