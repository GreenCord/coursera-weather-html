/**
 * Lambda function for putting received sensor data into DynamoDB table.
 * @module app/receiver
 */

const { DynamoDBClient, PutItemCommand } = require(`@aws-sdk/client-dynamodb`);

const client = new DynamoDBClient({ region: `us-east-2` });

/** Handles the incoming sensor data and puts it into DynamoDB table. Logs to Cloudwatch. */
exports.handleSensorData = async (event) => {
    console.log(`+++++ Receiver Handler Event :: `, JSON.stringify(event));
    let response = {};

    try {
        // Destructure event to retrieve sensor data information.
        const { clid, ts, temp, rhum } = event;

        if (clid && ts && temp && rhum) {
            // Format sensor data for storing into Dynamo.
            const params = {
                TableName: `aht20sensor-dev`,
                Item: {
                    "clid": { S: `${clid}` },
                    "ts": { S: `${ts}` },
                    "temp": { N: `${temp}` },
                    "rhum": { N: `${rhum}` }
                }
            };

            console.log(`params:`, JSON.stringify(params));
            try {
                // Attempt to PutItem via DynamoDB client.
                const data = await client.send(new PutItemCommand(params));

                // Assign success response.
                response = {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: `Received and stored new sensor data: ${JSON.stringify(params)}`
                    })
                };
            }
            catch (err) {
                // Catch error when awaiting response from Dynamo.
                console.log(`Error occurred sending data to Dynamo:`, err);
                // Assign error response related to DynamoDB issue.
                response = {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: `Error occurred sending data to Dynamo: ${JSON.stringify(err)}`
                    })
                };
            }
        }
        else {
            // Handle when event object doesn't contain all necessary sensor data and assign error response.
            console.log(`No valid sensor data received.`);
            response = {
                statusCode: 400,
                body: JSON.stringify({
                    message: `No valid sensor data was received.`
                })
            };
        }
    }
    catch (err) {
        // Generic/Unknown/Unhandled error handling.
        console.log(`Error`, JSON.stringify(err));
        // Assign error response.
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: `An unknown error occurred: ${JSON.stringify(err)}`
            })
        };
    }
    finally {
        // Return the assigned response.
        console.log(`+++++ Receiver Handler Response :: `, JSON.stringify(response));
        return response;
    }

};
