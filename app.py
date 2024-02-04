import datetime, json, pprint, redis, time
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
        self.__currentUnit = "F"
        self.__limits = {
            "t": {
                "min": 60,
                "max": 80
            },
            "h": {
                "min": 20,
                "max": 50
            }
        }

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
    def loadApp(self):
        limits = self.getLimits()
        readout = self.getLastReadout()

        if (readout == None):
            readout = {
                "temp": None,
                "rhum": None
            }
        
        return {
            "error": 0,
            "data": {
                "message": "App successfully loaded.",
                "limits": limits,
                "readout": readout
            }
        }

    def getLimits(self):
        return self.__limits
    
    def getSerialNumber(self):
        return self.__serialNumber
    
    def getLastReadout(self):
        history = list(self.getHistory())

        if (len(history) == 0):
            return None
        return sorted(history, key=lambda x: x["timestamp"])[-1]
    
    def getCurrentHumidity(self):
        last = self.getLastReadout()
        if (last != None):
            return last["rhum"]

    def getCurrentTemperature(self): 
        last = self.getLastReadout()
        print(f"last readout :: {last}")
        if (last != None):
            return last["temp"]

    def getCurrentUnit(self): 
        return self.__currentUnit

    def setCurrentUnit(self, unit):
        self.__currentUnit = unit
        return 0

    def handleCommand(self, command):
        print(f"::::: handleCommand :: {command}")
        
        match command:
            case "calculateStats":
                response = self.getMinMaxAvg()

            case "convertTemperature":
                self.statsCalculated = False
                response = self.convertCurrentTemperature()

            case "generate1":
                self.statsCalculated = False
                response = self.getReadout()
                
            case "generateN":
                self.statsCalculated = False
                response = self.getNReadouts()
            
            case "loadApp":
                response = self.loadApp()

            case "quit":
                response = {
                    "error": 0,
                    "data": {
                        "quit": 1,
                        "message": "Data saved. You may close this window."
                    }
                }
            case "resetKey":
                self.statsCalculated = False
                deleted = self.deleteHistory()
                response = {
                    "error": deleted,
                    "data": {
                        "message": "Error: History was not deleted.",
                        "readout": {
                            "temp": None,
                            "rhum": None,
                        }
                    }
                }
                if deleted == 0: 
                    response["data"]["message"] = "History deleted."

            case _:
                print("No valid command received")
                response = { 
                    "error": 1, 
                    "data": {
                        "message": "Invalid Command"
                    }
                 }
                
        return response

    # Helper Method to map readouts into a Dict for each type of readout value, for graphing
    def mapReadouts(self, n: int):
        '''
        Returns a dict of n temps, rhums, timestamps. temps will be returned
        using the current temperatureUnit.
        '''
        print("mapReadouts called")
        history = list(self.getHistory())
        print(f"What is history?", history)
        print(f"What is history's length?", len(history))
        
        if (len(history) == 0):
            print("History is empty, return dict with empty lists")
            return {
                "temps": [],
                "rhums": [],
                "timestamps": [],
            }
        
        history = sorted(history, key=lambda x: x["timestamp"])
        pprint.pprint(history)
        
        readoutsToMap = history[-n:]
        timestamps = []
        temps = []
        rhums = []
        for count, readout in enumerate(readoutsToMap):
            temp, rhum, timestamp = readout.values()            
            if self.__currentUnit == "C":
                temp = self.convertTemperature(temp, self.__currentUnit)
            
            temps.append(temp)
            rhums.append(rhum)
            timestamps.append(timestamp)
        mappedValues = {
            "temps": temps,
            "rhums": rhums,
            "timestamps": timestamps
        }
        print(f"mapReadouts complete :: {mappedValues}")
        return mappedValues    
    
    # History Methods
    def getHistory(self):
        history = list(self.__db.smembers(self.__serialNumber))
        self.__history = list(map(lambda x: json.loads(x), history))
        
        return self.__history
    
    def deleteHistory(self):
        print(f"deleteHistory called")
        sn = self.__serialNumber
        self.__db.delete(sn)
        self.getHistory()
        self.statMinTemp = None
        self.statMaxTemp = None
        self.statAvgTemp = None
        self.statMinRHum = None
        self.statMaxRHum = None
        self.statAvgRHum = None
        print(f"S/N {sn} history cleared from app: {self.__history} and DB: {self.__db.smembers(sn)}")
        return len(self.__history)
    
    def updateHistory(self, readout):
        print(f"updateHistory called")
        sn = self.__serialNumber
        db = self.__db
        db.sadd(sn, json.dumps(readout))
        self.getHistory()
        print(f"history updated, new length: {len(self.__history)}")

    # Sensor Reading Methods
    def getReadout(self):

        currentUnit = self.getCurrentUnit()
        readout = self.generateReadout()
        self.updateHistory(readout)
        
        if (currentUnit == "C"):
            readout["temp"] = self.convertTemperature(readout["temp"], currentUnit)
        
        response = {
            "error": 0,
            "data": {
                "message": "Readout updated.",
                "readout": readout,
                "unit": self.getCurrentUnit()
            }
        }
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
            "timestamp": currentTime.timestamp(),
        }
        print("New readout generated:")
        pprint.pprint(readout)
        return readout
            
    # Statistics
    def getMinMaxAvg(self):
        print(f"getMinMaxAvg called")
        temps, rhums, timestamps = self.mapReadouts(self.nStats).values()

        if (len(temps) == 0 | len(rhums) == 0):
            return {
                "error": 1,
                "data": {
                    "message": "Not enough data to calculate stats."
                }
            }
        
        
        self.statMinTemp = round(min(temps))
        self.statMaxTemp = round(max(temps))
        self.statAvgTemp = round(mean(temps))
    
        self.statMinRHum = round(min(rhums))
        self.statMaxRHum = round(max(rhums))
        self.statAvgRHum = round(mean(rhums))
        
        self.statsCalculated = True
       
        response = {
            "error": 0,
            "data": {
                "message": "Stats calculated.",
                "stats": {
                    "temperature": {
                        "avg": self.statAvgTemp,
                        "max": self.statMaxTemp,
                        "min": self.statMinTemp,
                    },
                    "humidity": {
                        "avg": self.statAvgRHum,
                        "max": self.statMaxRHum,
                        "min": self.statMinRHum,
                    }
                },
                "unit": self.__currentUnit
            }
        }
        print(f"genMinxMaxAvg complete :: {response}")
        return response

    # Temperature Conversion Methods
    def convertCurrentTemperature(self):
        print(f"convertTemperature called", self.getLimits())
        
        # Current Temperature always returns in °F
        currentTemperature = round(self.getCurrentTemperature())
        currentUnit = self.getCurrentUnit()
        newTemperature = None
        newUnit = None
        limits = self.getLimits()
        newTMin = limits["t"]["min"]
        newTMax = limits["t"]["max"]
        print("Retrieved limits:")
        pprint.pprint(limits)
        if currentUnit == "F":
            print("Converting F to C...")
            newTemperature = round(self.convertTemperature(currentTemperature, "C"))
            newTMin = round(self.convertTemperature(limits["t"]["min"], "C"))
            newTMax = round(self.convertTemperature(limits["t"]["max"], "C"))
            newUnit = "C"
            print(f"Converted {currentTemperature}°{currentUnit} to {newTemperature}°{newUnit}")
        else:
            print("Returning °F")
            newTemperature = currentTemperature
            newUnit = "F"
        
        self.setCurrentUnit(newUnit)
        print(f"Current unit updated :: {self.getCurrentUnit()}")

        response = {
            "error": 0,
            "data": {
                "message": f"Temperature now displayed in °{newUnit}",
                "limits": {
                    "t": {
                        "min": newTMin,
                        "max": newTMax
                    },
                    "h": limits["h"]
                },
                "readout": {
                    "temp": newTemperature,
                    "rhum": self.getCurrentHumidity()
                },
                "unit": self.getCurrentUnit()
            }
        }
        print(f"Did __limits stay? :: {self.getLimits()}")
        print(f"convertTemperature complete :: {response}")
        return response

    def convertTemperature(self, degrees, toUnit):
        if toUnit == "C":
            return (degrees - 32) * 5 / 9
        elif toUnit == "F":
            return (degrees * 9 / 5) + 32
        else: return degrees
