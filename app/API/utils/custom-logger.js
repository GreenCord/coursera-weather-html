export default class Logger {
    constructor(name) {
        this.name = name;
        this.paddedName = this.name.padEnd(13, ` `);
        this.spc = ` `;
    }
    #formatLogString(level = `DEBUG`, msg) { return `${level.padEnd(8, this.spc)}[ ${this.paddedName} ] ${msg}`; }
    debug(msg, data) { console.debug(this.#formatLogString(`DEBUG`, msg), data); }
    info(msg, data) { console.info(this.#formatLogString(`INFO`, msg), data); }
    warn(msg, data) { console.warn(this.#formatLogString(`WARN`, msg), data); }
    error(msg, data) { console.error(this.#formatLogString(`ERROR`, msg), data); }
}
