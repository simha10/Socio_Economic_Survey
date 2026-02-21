// Simple logging controller to receive frontend logs and print to terminal
const logFrontendMessage = (req, res) => {
  try {
    const { timestamp, message, data, userAgent, url } = req.body;
    
    // Print to terminal with formatting
    console.log('\n=== FRONTEND LOG ===');
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Message: ${message}`);
    console.log(`URL: ${url}`);
    console.log(`User Agent: ${userAgent}`);
    if (data) {
      console.log('Data:', JSON.stringify(data, null, 2));
    }
    console.log('===================\n');
    
    res.status(200).json({ success: true, message: 'Log received' });
  } catch (error) {
    console.error('Error processing frontend log:', error);
    res.status(500).json({ success: false, error: 'Failed to process log' });
  }
};

module.exports = {
  logFrontendMessage
};