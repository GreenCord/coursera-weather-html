/**
 * @module API/v1/hello
*/
import Logger from "../utils/custom-logger.js";

const name = `hello`;
const log = new Logger(`API (${name.toUpperCase()})`);

/**
 * Returns a success message for testing successful connection through the API Gateway.
 * @param {Object} event - Event received when the lambda function is invoked.
 * @returns {Object} The response object indicating success.
 */
export async function hello(event) {
    log.req(name, event);

    const response = {
        statusCode: 418,
        body: JSON.stringify({
            message: `Short and stout!`,
        }),
    };

    log.res(name, response);
    return response;
};