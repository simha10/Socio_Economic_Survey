/**
 * Send success response
 */
exports.sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    console.log('[RESPONSE-HELPER] Sending success response:', { statusCode, message, hasData: !!data });
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
    console.log('[RESPONSE-HELPER] Sending error response:', { statusCode, message, errors });
    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors,
    });
};
