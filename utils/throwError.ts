export const throwError = (event, context, callback, errorMessage, statusCode) => {
    const response = {
        statusCode,
        body: JSON.stringify({ message: errorMessage })
    };
    callback(null, response);
}
