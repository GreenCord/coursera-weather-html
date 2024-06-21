import Logger from './utils/custom-logger.js';

/**
 * Lambda function as a REST API to interface with sensor data in Dynamo DB
 * @module app/API
 * @see hello
 * @see create
 * @see read
 * @see update
 * @see del
 */
const logger = new Logger(`REST API`);

/**
 * Returns a success message for testing successful connection through the API Gateway.
 * @param {Object} event - Event received when the lambda function is invoked.
 * @returns {Object} The response object indicating success.
 */
export async function hello(event) {
    logger.debug(`Hello endpoint`, JSON.stringify(event));
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Go Serverless v4! Your function executed successfully!`,
        }),
    };
};
/**
 * CREATE (NOT IMPLEMENTED)
 * This would be the Create endpoint of the API.
 * @param {Object} event - Event received when the lambda function is invoked.
 * @returns {Object} The response object indicating 501 NOT IMPLEMENTED.
 */
export async function create(event) {
    logger.debug(`Create endpoint`, JSON.stringify(event));
    return {
        statusCode: 501,
        body: JSON.stringify({
            message: `Create not implemented for this API.`
        })
    };
};
/**
 * READ
 * Reads the sensor data for the sensor indicated by the URL path.
 * @param {Object} event - Event received when the lambda function is invoked.
 * @returns {Object} The response object indicating success.
 */
export async function read(event) {
    logger.debug(`Read endpoint`, JSON.stringify(event));
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Read endpoint successfully invoked!`,
            event: event
        })
    };
};
/**
 * UPDATE (NOT IMPLEMENTED)
 * This would be the Update endpoint of the API.
 * @param {Object} event - Event received when the lambda function is invoked.
 * @returns {Object} The response object indicating 501 NOT IMPLEMENTED.
 */
export async function update(event) {
    logger.debug(`Update endpoint`, JSON.stringify(event));
    return {
        statusCode: 501,
        body: JSON.stringify({
            message: `Update not implemented for this API.`
        })
    };
};
/**
 * DELETE (NOT IMPLEMENTED)
 * This would be the Delete endpoint of the API.
 * @param {Object} event - Event received when the lambda function is invoked.
 * @returns {Object} The response object indicating 501 NOT IMPLEMENTED.
 */
export async function del(event) {
    logger.debug(`Delete endpoint`, JSON.stringify(event));
    return {
        statusCode: 501,
        body: JSON.stringify({
            message: `Delete not implemented for this API.`
        })
    };
};