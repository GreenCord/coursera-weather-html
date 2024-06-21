/**
 * @module API//v1/update
 */
import Logger from "../utils/custom-logger.js";

const fnName = `update`;
const log = new Logger(`API`);

/**
 * UPDATE (NOT IMPLEMENTED)
 * This would be the Update endpoint of the API.
 * @param {Object} event - Event received when the lambda function is invoked.
 * @returns {Object} The response object indicating 501 NOT IMPLEMENTED.
 */
export async function update(event) {
    log.req(fnName, event);

    const response = {
        statusCode: 501,
        body: JSON.stringify({
            message: `Update not implemented for this API.`
        })
    };

    log.res(fnName, response);
    return response;

};