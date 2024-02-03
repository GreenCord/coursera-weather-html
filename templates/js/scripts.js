window.onload = (event) => {

    const locale = document.getElementById("locale").textContent;
    const app = {
        locale,
        firstLaunch: true,
        numSuccesses: 0,
        numTrials: 0,
        status: {
            inputIsDisabled: false,
        },
        commands: {
            ack: { "command": "ack" },
            calculateStats: { "command": "calculateStats" },
            convertTemperature: { "command": "convertTemperature" },
            generate1: { "command": "generate1" },
            generateN: { "command": "generateN" },
            quit: { "command": "quit" },
            resetKey: { "command": "resetKey" },
            valid: [
                "calculateStats",
                "convertTemperature",
                "generate1",
                "generateN",
                "quit",
                "resetKey"
            ],
        },
        connection: {
            offline: "&#x25cf; OFFLINE",
            online: "&#x25cf; ONLINE",
            unknown: "&#x25cf; UNKNOWN",
        },
        el: {
            cnx: document.getElementById('connectionStatus'),
            status: document.getElementById('statusMessage'),
            btn: {
                calculateStats: document.getElementById('calculateStats'),
                convertTemperature: document.getElementById('convertTemperature'),
                generate1: document.getElementById('generate1'),
                generateN: document.getElementById('generateN'),
                quit: document.getElementById('quit'),
                resetKey: document.getElementById('resetKey'),
            },
            stats: {
                h: document.getElementById('humidityStatsRow'),
                t: document.getElementById('temperatureStatsRow'),
            },
        },
        fn: {
            clearStats: function() {
                app.el.stats.h.textContent = "";
                app.el.stats.t.textContent = "";
            }
        },
        limits: {
            maxTemp: 80,
            minTemp: 60,
            maxHum: 50,
            minHum: 25,
        },
    }

    const webSocket = new WebSocket("ws://localhost:8888/websocket/");

    window.addEventListener("click", function (e) {
        const id = e.target.id;
        console.log('Click! ', id)
        if (app.commands.valid.includes(id)) {
            e.preventDefault()
            app.fn.clearStats();
            if (id == "generateN") {
                console.log('Long operation, disable inputs');
                toast.write(app.el.status,"Getting sensor data, please wait...");
                app.status.inputIsDisabled = true;
                for (const key in app.el.btn) {
                    if (Object.hasOwnProperty.call(app.el.btn, key) && key !== "quit") {
                        const btn = app.el.btn[key];
                        btn.disabled = true;
                    }
                }
            } 
            webSocket.send(JSON.stringify(app.commands[id]));
        }
    })

    const toast = {
        clear(el) {
            el.textContent = "";
            this.timeoutID = undefined;
        },
        pop(el, msg) {
            console.log("Pop a toast!")
            if (typeof this.timeoutID === "number") this.cancel();
            el.textContent = msg
            this.timeoutID = setTimeout(
                (element) => {
                    this.clear(element)
                },
                5000,
                el
            )
        },
        write(el, msg) {
            console.log("Write a message!")
            if (typeof this.timeoutID === "number") this.cancel()
            el.textContent = msg
        },
        cancel() {
            clearTimeout(this.timeoutID)
        },
    }

    webSocket.onopen = (event) => {
        console.log(webSocket);
        console.log('webSocket.onopen fired')

        app.el.cnx.classList.remove('disconnected');
        app.el.cnx.classList.remove('unknown');
        app.el.cnx.classList.add('connected');
        app.el.cnx.innerHTML = app.connection.online;
        toast.pop(app.el.status, "Sensors are connected.")

        if (app.firstLaunch) {
            console.log("App first launch.")
            webSocket.send(JSON.stringify(app.commands.generate1));
            app.firstLaunch = false;
        }
        else {
            webSocket.send(JSON.stringify(app.commands.ack))
        }
    }

    webSocket.onmessage = (event) => {
        console.log(`onmessage fired: ${event.data}`);
        response = JSON.parse(event.data)
        const { ack, data } = response;
        console.log(`ack`,ack)
        let { message } = data;
        if (ack && ack === 'ack') {
            if (data.hasOwnProperty('readout')) {
                const { readout } = data;
                const unit = data.hasOwnProperty('unit') ? data.unit : "F";
                updateLabels(readout, unit)
            }
            if (data.hasOwnProperty('stats')) {
                const { stats } = data
                const temperatureString = `Min: ${stats.temperature.min}° :: Max: ${stats.temperature.max}° :: Avg: ${stats.temperature.avg}°`
                const humidityString = `Min: ${stats.humidity.min}% :: Max: ${stats.humidity.max}% :: Avg: ${stats.humidity.avg}%`
                app.el.stats.t.textContent = temperatureString
                app.el.stats.h.textContent = humidityString
            }
            if (data.hasOwnProperty('quit')) {
                if (data["quit"]) {
                    const header = document.getElementsByTagName("header")[0]
                    const main = document.getElementsByTagName("main")[0]
                    header.classList.add('hidden')
                    main.classList.add('quit');
                    main.textContent = data.message;
                    webSocket.close();
                }
            }
        }
        if (!message && !message.length) message = "Something went wrong."
        toast.pop(app.el.status, message)
        if (app.status.inputIsDisabled) {
            for (const key in app.el.btn) {
                if (Object.hasOwnProperty.call(app.el.btn, key)) {
                    const btn = app.el.btn[key];
                    btn.disabled = false;
                }
            }
            app.status.inputIsDisabled = false;
        }
    }

    webSocket.onclose = (event) => {
        console.log('webSocket.onclose fired', event)
        app.el.cnx.classList.add('disconnected');
        app.el.cnx.classList.remove('unknown');
        app.el.cnx.classList.remove('connected');
        app.el.cnx.innerHTML = app.connection.offline;
        toast.pop(app.el.status, "Sensors are disconnected.")
    }

    webSocket.onerror = (event) => {
        console.log('webSocket.onerror fired', event)
    }
    
    function updateLabels(readout, unit) {
        console.log('updateLabels function called');
        console.log(`New readout :: ${JSON.stringify(readout)}`)
        console.log(`Current Unit :: ${unit}`)
        const tRow = document.getElementById("temperatureRow");
        const hRow = document.getElementById("humidityRow");
        const temperatureLabel = document.getElementById("temperatureLabel");
        const temperatureUnit = document.getElementById("temperatureUnit");
        const humidityLabel = document.getElementById("humidityLabel");
        const temperature = readout.temp ? Math.round(readout.temp) : "—";
        const humidity = readout.rhum ? Math.round(readout.rhum) : "—";

        temperatureLabel.textContent = temperature;
        temperatureUnit.textContent = unit;
        humidityLabel.textContent = humidity;

        const tempStatus = temperature > app.limits.maxTemp
            ? "tooHigh"
            : temperature < app.limits.minTemp
                ? "tooLow"
                : "normal"
        const humStatus = temperature > app.limits.maxHum
            ? "tooHigh"
            : temperature < app.limits.minHum
                ? "tooLow"
                : "normal"


        switch (tempStatus) {
            case "tooHigh":
                tRow.classList.add('toohigh')
                break;
            case "tooLow":
                tRow.classList.add('toolow')
                break;
            default:
                tRow.classList.remove('toohigh');
                tRow.classList.remove('toolow');
        }

        switch (humStatus) {
            case "tooHigh":
                hRow.classList.add('toohigh')
                break;
            case "tooLow":
                hRow.classList.add('toolow')
                break;
            default:
                hRow.classList.remove('toohigh');
                hRow.classList.remove('toolow');
        }
    }

}
