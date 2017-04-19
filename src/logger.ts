
export const logger = require('ournet.logger');

if (process.env.NODE_ENV === 'production') {
	logger.loggly({
		tags: ['entitizer-api'],
		json: true
	});
	logger.removeConsole();
}
