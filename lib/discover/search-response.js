'use strict'

const resolveService = require('../commands/resolve-service')

const searchResponse = (ssdp, message) => {

  const index = message.remote.findIndex(function findRemote(remote) {
    return remote.family === 'IPv4';
  });

  var remote = null;
  if (index > -1) {
   remote = message.remote[index];
  }

  resolveService(ssdp, message.USN, message.ST, remote || message.LOCATION, message.ttl())
}

module.exports = searchResponse
