'use strict'

var EventEmitter = require('events').EventEmitter
var util = require('util')
var parseOptions = require('./parse-options')
var createSockets = require('./create-sockets')
var advertise = require('./advertise')
var discover = require('./discover')
var notify = require('./commands/notify')
var search = require('./commands/search')
var searchResponse = require('./discover/search-response')
var adverts = require('./adverts')
var async = require('async')

function SSDP (options, callback) {
  if (!(this instanceof SSDP)) {
    return new SSDP(options, callback)
  }

  EventEmitter.call(this)

  if (callback) {
    this.once('ready', callback)
  }

  options = parseOptions(options)

  var self = this

  var methods = ['advertise', 'discover', 'stop']
  methods.forEach(function (method) {
    self[method] = function () {
      var args = Array.prototype.slice.call(arguments)

      self.once('ready', function () {
        self[method].apply(self, args)
      })
    }
  })

  // set up UDP sockets listening for SSDP broadcasts
  process.nextTick(createSockets.bind(null, self, options, function (error, sockets) {
    if (!error) {
      self.advertise = advertise.bind(null, self, sockets, options.udn)
      self.discover = discover.bind(null, self, sockets)
      self.stop = function (callback) {
        async.series(adverts.map(function (advert) {
          return advert.stop.bind(advert)
        }).concat(sockets.map(function (socket) {
          return function (next) {
            socket.close()
            socket.closed = true
            socket.on('close', next)
          }
        })), callback)
      }
      self.on('M-SEARCH', search.bind(null, self, sockets, options.udn))
      self.on('NOTIFY', notify.bind(null, self))
      self.on('SEARCH-RESPONSE', searchResponse.bind(null, self))
    }

    if (error) {
      self.emit('error', error)
    } else {
      self.emit('ready')
    }
  }))
}
util.inherits(SSDP, EventEmitter)

module.exports = SSDP