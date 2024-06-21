/**
 * @module API/v1/create
 */
import Logger from "../utils/custom-logger.js";

const fnName = `create`;
const log = new Logger(`API`);

/**
 * CREATE (NOT IMPLEMENTED)
 * This would be the Create endpoint of the API.
 * @param {Object} event - Event received when the lambda function is invoked.
 * @returns {Object} The response object indicating 501 NOT IMPLEMENTED.
*/
export async function create(event) {
    log.req(fnName, event);

    const response = {
        statusCode: 501,
        body: JSON.stringify({
            message: `Create not implemented for this API.`
        })
    };

    log.res(fnName, response);
    return response;

};