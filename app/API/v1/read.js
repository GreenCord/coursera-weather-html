/**
 * @module API/v1/read
 */
import Logger from "../utils/custom-logger.js";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const fnName = `read`;
const log = new Logger(`API`);
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
    log.req(event);

    const { pathParameters } = event;
    const { clid } = pathParameters;
    const response = {};
    const params = {
        TableName: `aht20sensor-dev`,
        ExpressionAttributeValues: {
            ":clid": {
                "S": `${clid}`,
            },
        },
        FilterExpression: `clid = :clid`,
    };


    try {
        console.debug(`Attempting to connect to Dynamo and retrieve readouts for client ID ${clid}`);
        console.debug(`Params: `, params);
        const data = await client.send(new ScanCommand(params));

        console.log(`Dynamo DB Query Result :: ` + JSON.stringify(data.Items));
        // Sort items by timestamp ascending, latest item at end.
        data.Items.sort((a, b) => a.ts.N - b.ts.N);


        const readout = unmarshall(data.Items.pop());

        response.statusCode = 200;
        response.body = JSON.stringify(readout);
    }
    catch (err) {
        console.error(`An error occurred getting the latest readout.` + JSON.stringify(err));

        response.statusCode = 500;
        response.body = JSON.stringify({
            message: `An unknown error occurred for API (${fnName})`
        });
    }


    log.res(response);
    return response;

};