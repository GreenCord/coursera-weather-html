import json, pprint, requests

from datetime import datetime
from simple_chalk import chalk

limits = {
    "t": {
        "min": 19,
        "max": 30
    },
    "h": {
        "min": 20,
        "max": 50
    }
}
endpoint = 'https://ypctri9nwh.execute-api.us-east-2.amazonaws.com/sensor/1000000'
print(chalk.whiteBright("Retrieving sensor data from API endpoint: ") + chalk.blueBright(endpoint) + chalk.whiteBright(" ..."))
r = requests.get(endpoint)

data = json.loads(r.text)
print(chalk.greenBright("Data received:"))
pprint.pp(data)
print('Formatting data....')
latestTemp = data["latest"]["temp"]
latestRhum = data["latest"]["rhum"]

tempArrow = chalk.green("Temperature") + chalk.greenBright(" -> ")
rhumArrow = chalk.green("R. Humidity") + chalk.greenBright(" -> ")

tooWarm = chalk.red(" TOO HOT!  " + chalk.redBright(" ↑↑↑"))
tooCold = chalk.blue(" TOO COLD! " + chalk.blueBright(" ↓↓↓"))
tooWet = chalk.blue(" TOO HUMID!" + chalk.blueBright(" ↑↑↑"))
tooDry = chalk.yellow(" TOO DRY!  " + chalk.yellowBright(" ↓↓↓"))

tempString = tempArrow + f"{latestTemp:> 6.2f}" + chalk.grey("°C ::")
rhumString = rhumArrow + f"{latestRhum:> 6.2f}" + chalk.grey("%  ::")

if (latestTemp < limits["t"]["min"]):
    tempString += tooCold
elif (latestTemp > limits["t"]["max"]):
    tempString += tooWarm

if (latestRhum < limits["h"]["min"]):
    rhumString += tooDry
elif (latestRhum > limits["h"]["max"]):
    rhumString += tooWet
print(chalk.blue("------------------------------"))
print(chalk.blue("[[[[[ ") + chalk.blueBright("Latest Sensor Data") + chalk.blue(" ]]]]]"))
print(chalk.blue("------------------------------"))

print(tempString)
print(rhumString)

print(chalk.blue("=============================="))
print(chalk.green("History") + chalk.greenBright(" ->  ") + chalk.whiteBright(len(data["history"])) + chalk.white(" readouts"))
print(chalk.blue("------------------------------"))
for readout in data["history"]:
    pReadout = {
        "temp": readout["temp"],
        "rhum": readout["rhum"]
    }
    timestamp = datetime.fromtimestamp(readout["ts"])
    print(chalk.greenBright(timestamp))
    pprint.pp(pReadout)
    print(chalk.blue("------------------------------"))