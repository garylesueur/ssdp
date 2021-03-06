'use strict'

const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const sinon = require('sinon')
const discover = require('../../../lib/discover')

describe('lib/discover', () => {
  it('should send a search message', () => {
    const ssdp = {
      emit: sinon.stub()
    }
    const serviceType = 'serviceType'

    discover(ssdp, serviceType)

    expect(ssdp.emit.calledOnce).to.be.true
    expect(ssdp.emit.getCall(0).args[0]).to.equal('ssdp:send-message')
    expect(ssdp.emit.getCall(0).args[1]).to.equal('M-SEARCH * HTTP/1.1')
    expect(ssdp.emit.getCall(0).args[2].ST).to.equal(serviceType)
    expect(ssdp.emit.getCall(0).args[2].MAN).to.equal('ssdp:discover')
    expect(ssdp.emit.getCall(0).args[2].MX).to.equal(0)
  })

  it('should default to global search', () => {
    const ssdp = {
      emit: sinon.stub()
    }

    discover(ssdp)

    expect(ssdp.emit.calledOnce).to.be.true
    expect(ssdp.emit.getCall(0).args[0]).to.equal('ssdp:send-message')
    expect(ssdp.emit.getCall(0).args[1]).to.equal('M-SEARCH * HTTP/1.1')
    expect(ssdp.emit.getCall(0).args[2].ST).to.equal('ssdp:all')
    expect(ssdp.emit.getCall(0).args[2].MAN).to.equal('ssdp:discover')
    expect(ssdp.emit.getCall(0).args[2].MX).to.equal(0)
  })
})
