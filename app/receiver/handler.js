exports.hello = async (event) => {
    console.log(`+++++ Receiver Handler Event :: `, JSON.stringify(event));
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: `Go Serverless v4.0! Your function executed successfully!`
        })
    };

    console.log(`+++++ Receiver Handler Response :: `, JSON.stringify(response));
    return response;
};
