var pump = require('pump')
var discovery = require('hyperdiscovery')

module.exports = function (cabal, cb) {
  cb = cb || function () {}

  cabal.getLocalKey(function (err, key) {
    if (err) return cb(err)

    var swarm = discovery(cabal, { id: Buffer.from(key, 'hex') })

    swarm.on('connection', function (conn, info) {
      var remoteKey = info.id.toString('hex')
      conn.once('error', function () { if (remoteKey) cabal._removeConnection(remoteKey) })
      conn.once('end', function () { if (remoteKey) cabal._removeConnection(remoteKey) })

      var r = cabal.replicate()
      pump(conn, r, conn, function (err) {
        // TODO: report somehow
      })

      cabal._addConnection(remoteKey)
    })

    cb(null, swarm)
  })
}
