/**
 * Send success response
 */
exports.sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message: message,
        data: data,
    });
};

/**
 * Send error response
 */
exports.sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors,
    });
};
