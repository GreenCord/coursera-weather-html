/**
 * Lambda function as a REST API to interface with sensor data in Dynamo DB
 * @module app/API
 */

exports.hello = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Go Serverless v4! Your function executed successfully!`,
        }),
    };
};

exports.create = async (event) => {
    return {
        statusCode: 501,
        body: JSON.stringify({
            message: `Create not implemented for this API.`
        })
    }
}
exports.read = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Read endpoint successfully invoked!`
        })
    }
}
exports.update = async (event) => {
    return {
        statusCode: 501,
        body: JSON.stringify({
            message: `Update not implemented for this API.`
        })
    }
}
exports.delete = async (event) => {
    return {
        statusCode: 501,
        body: JSON.stringify({
            message: `Delete not implemented for this API.`
        })
    }
}