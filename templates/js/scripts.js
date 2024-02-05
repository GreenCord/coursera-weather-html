window.onload = (event) => {
    
    const locale = document.getElementById("locale").textContent;
    const webSocket = new WebSocket("ws://localhost:8888/websocket/");
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
            loadApp: { "command": "loadApp" },
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
            graph: {
                h: document.getElementById('humidityGraphRow'),
                t: document.getElementById('temperatureGraphRow')
            }
        },
        fn: {
            clearStats: function() {
                app.el.stats.h.textContent = "";
                app.el.stats.t.textContent = "";
            },
            convertTimestamps: function(arr) {
                arr.forEach((el) => {
                    el.timestamp = el.timestamp * 1000;
                    el["date"] = new Date(el.timestamp);
                })
                return arr
            },
            graphAxisScale: function(axis, data, key, positioning){
                const extent = d3.extent(data, d => d[key]);
                console.log(`Extent for ${key}: ${JSON.stringify(extent)}`)
                if (axis.toLowerCase() === "x") return d3.scaleUtc(extent,positioning)
                // return d3.scaleThreshold(extent, positioning)
                return d3.scaleLinear(extent, positioning)
            },
            graphHistory: function(history) {
                app.el.graph.t.innerHTML = "";
                app.el.graph.h.innerHTML = "";

                const graphHistory = app.fn.convertTimestamps(history)
               
                // Declare the chart dimensions and margins.
                const width = 928;
                const height = 250;
                const marginTop = 20;
                const marginRight = 30;
                const marginBottom = 30;
                const marginLeft = 40;

                // Declare the x (horizontal position) scale.
                const x = app.fn
                    .graphAxisScale("x", graphHistory, "date", [marginLeft, width - marginRight]);

                // Declare the y (vertical position) scale.
                const yT = app.fn
                    .graphAxisScale("y", graphHistory, "temp", [height - marginBottom, marginTop])

                const yTScale = d3.scaleThreshold([app.limits.minTemp, app.limits.maxTemp], ["#1789FC", "#c4cad0", "#db4437"])

                const yH = app.fn
                    .graphAxisScale("y", graphHistory, "rhum", [height - marginBottom, marginTop])

                // Declare the line generators
                const gradientT = {
                    id: "temp",
                    href: new URL("#temp", window.location.href)
                }
                const tLine = d3.line()
                    .curve(d3.curveBasis)
                    .defined(d => !isNaN(d.temp))
                    .x(d => x(d.date))
                    .y(d => yT(d.temp))
                
                const gradientH = {
                    id: "hum",
                    href: new URL("#hum", window.location.href)
                }

                const hLine = d3.line()
                    .curve(d3.curveBasis)
                    .defined(d => !isNaN(d.rhum))
                    .x(d => x(d.date))
                    .y(d => yH(d.rhum))

                // Create the SVG container for Temperature graph.
                const svgT = d3.create("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("viewBox", [0, 0, width, height])
                    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
                
                // Add the x-axis.
                svgT.append("g")
                    .attr("transform", `translate(0,${height - marginBottom})`)

                // Add the y-axis.
                svgT.append("g")
                    .attr("transform", `translate(${marginLeft},0)`)
                    .attr("style", "color: transparent")
                    .call(g => g.select(".domain").remove())
                    .call(g => g.selectAll(".tick line").remove())

                // Add the gradient
                svgT.append("linearGradient")
                    .attr("id", gradientT.id)
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", 0)
                    .attr("y2", height)
                  .selectAll("stop")
                    .data([
                        {offset: "0%", color: "#db4437" },
                        {offset: yT(app.limits.maxTemp) / height, color: "#db4437"},
                        {offset: yT(app.limits.maxTemp) / height, color: "#c4cad0"},
                        {offset: yT(app.limits.minTemp) / height, color: "#c4cad0"},
                        {offset: "100%", color: "#1789FC"},
                    ])
                  .join("stop")
                    .attr("offset", d => d.offset)
                    .attr("stop-color", d => d.color);

                // Append paths for lines
                svgT.append("path")
                    .attr("fill", "none")
                    .attr("stroke", `url(${gradientT.href})`)
                    .attr("stroke-width", 1.5)
                    .attr("d", tLine(graphHistory));

                // Create the SVG container for Humidity graph.
                const svgH = d3.create("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("viewBox", [0, 0, width, height])
                    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
                
                // Add the x-axis.
                svgH.append("g")
                    .attr("transform", `translate(0,${height - marginBottom})`)

                // Add the y-axis.
                svgH.append("g")
                    .attr("transform", `translate(${marginLeft},0)`)
                    .call(g => g.select(".domain").remove())
                    .call(g => g.selectAll(".tick line").remove())

                // Add the gradient
                svgH.append("linearGradient")
                    .attr("id", gradientH.id)
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", 0)
                    .attr("y2", height)
                  .selectAll("stop")
                    .data([
                        {offset: "0%", color: "#1789FC" },
                        {offset: yT(app.limits.maxTemp) / height, color: "#1789FC"},
                        {offset: yT(app.limits.maxTemp) / height, color: "#c4cad0"},
                        {offset: yT(app.limits.minTemp) / height, color: "#c4cad0"},
                        {offset: "100%", color: "#c8963e"},
                    ])
                  .join("stop")
                    .attr("offset", d => d.offset)
                    .attr("stop-color", d => d.color);

                // Append paths for lines
                svgH.append("path")
                    .attr("fill", "none")
                    .attr("stroke", `url(${gradientH.href})`)
                    .attr("stroke-width", 1.5)
                    .attr("d", hLine(graphHistory));
                
                // Append the SVG element.
                temperatureGraphRow.append(svgT.node());
                humidityGraphRow.append(svgH.node());
            }
        },
        limits: {
            maxTemp: undefined,
            minTemp: undefined,
            maxHum: undefined,
            minHum: undefined,
        },
    }

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
            webSocket.send(JSON.stringify(app.commands.loadApp))
            // webSocket.send(JSON.stringify(app.commands.generate1));
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
            if (data.hasOwnProperty('limits')) {
                app.limits.minTemp = data.limits.t.min;
                app.limits.maxTemp = data.limits.t.max;
                app.limits.minHum = data.limits.h.min;
                app.limits.maxHum = data.limits.h.max;
                console.log(`Limits receieved. Updated local app to use them :: ${JSON.stringify(app.limits)}`)
            }
            if (data.hasOwnProperty('history')) {
                app.fn.graphHistory(data.history);
            }
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
        const humStatus = humidity > app.limits.maxHum
            ? "tooHigh"
            : humidity < app.limits.minHum
                ? "tooLow"
                : "normal"


        switch (tempStatus) {
            case "tooHigh":
                tRow.classList.add('toohigh');
                app.el.stats.t.textContent = "Too hot!";
                break;

            case "tooLow":
                tRow.classList.add('toolow');
                app.el.stats.t.textContent = "Too cold!";
                break;

            default:
                tRow.classList.remove('toohigh');
                tRow.classList.remove('toolow');
                app.el.stats.t.textContent = "";
        }

        switch (humStatus) {
            case "tooHigh":
                hRow.classList.add('toohigh');
                app.el.stats.h.textContent = "Too humid!"
                break;

            case "tooLow":
                hRow.classList.add('toolow')
                app.el.stats.h.textContent = "Too dry!"
                break;

            default:
                hRow.classList.remove('toohigh');
                hRow.classList.remove('toolow');
                app.el.stats.h.textContent = ""
        }
    }

}
