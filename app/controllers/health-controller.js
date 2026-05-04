const adapterClient = require('../clients/adapterClient');
const authClient = require('../clients/authClient');

function getHealth(req, res) {
  res.status(200).json({
    service: 'mrms',
    status: 'ok',
    adapter: {
      mockMode: adapterClient.isMockMode(),
      baseUrlConfigured: Boolean(adapterClient.getBaseUrl()),
    },
    auth: {
      mockMode: authClient.isMockMode(),
      baseUrlConfigured: Boolean(authClient.getBaseUrl()),
    },
  });
}

module.exports = { getHealth };
