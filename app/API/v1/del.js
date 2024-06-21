/**
 * @module API/del
 */
import Logger from "../utils/custom-logger.js";

const fnName = `del`;
const log = new Logger(`API`);

/**
 * (NOT IMPLEMENTED) This would be the Delete endpoint of the API.
 * @param {Object} event - Event received when the lambda function is invoked.
 * @returns {Object} The response object indicating 501 NOT IMPLEMENTED.
 */
export async function del(event) {
    log.req(fnName, event);

    const response = {
        statusCode: 501,
        body: JSON.stringify({
            message: `Delete not implemented for this API.`
        })
    };

    log.res(fnName, response);
    return response;

};