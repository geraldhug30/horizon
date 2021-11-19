const jwt = require('jsonwebtoken')

module.exports = async function (req, res, next) {
  // get token from header
  const token = await req.header('x-auth-token')
  // check if not token
  if (!token) res.status(401).json({ msg: 'No token, authorization denied' })
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded.user
    next()
  } catch (error) {
    console.log(error)
    res.status(401).json({ msg: 'Token is not valid' })
  }
}
