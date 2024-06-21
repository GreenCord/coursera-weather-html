/**
 * @module API/read
 */
import Logger from "../utils/custom-logger.js";


const fnName = `read`;
const log = new Logger(`API`);
const { DynamoDBClient, GetItemCommand } = require(`@aws-sdk/client-dynamodb`);
const client = new DynamoDBClient({ region: `us-east-2` });

/**
 * Returns (a dummy) readout for a sensor device.
 * @param {String} clid - The incoming client ID used for retrieving readouts from DynamoDB
 * @returns {Object} The response object containing the readout for the incoming client ID
 */
async function getLatestReadout(clid) {
    const ts = Date.now();

    // return dummy readout for testing
    return {
        clid,
        ts,
        temp: `21.4354736354634`,
        rhum: `48.8976456728935`,
    };
}

/**
 * Reads the sensor data for the sensor indicated by the URL path.
 * @param {Object} event - Event received when the lambda function is invoked.
 * @returns {Object} The response object indicating success.
 */
export async function read(event) {
    log.req(fnName, event);

    const { pathParameters } = event;
    const { clid } = pathParameters;
    const response = {};

    console.debug(`Working with clientId ${clid}`);

    try {
        const readout = await getLatestReadout(clid);

        response.statusCode = 200;
        response.body = JSON.stringify(readout);
    }
    catch (err) {
        console.error(`An error occurred getting the latest readout.`, JSON.stringify(err));

        response.statusCode = 500;
        response.body = JSON.stringify({
            message: `An unknown error occurred for API (${fnName})`
        });
    }


    log.res(fnName, response);
    return response;

};