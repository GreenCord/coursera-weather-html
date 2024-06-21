export default class Logger {
    constructor(fnName) {
        this.name = fnName;
    }
    req(data) {
        console.log(`+++++ REQUEST (${this.name}) :: ${JSON.stringify(data)}`);
    }
    res(data) {
        console.log(`+++++ RESPONSE (${this.name}) :: ${JSON.stringify(data)}`);
    }
}