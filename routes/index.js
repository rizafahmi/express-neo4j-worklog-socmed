var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  let user
  if (req.session) {
    user = req.session.user
  } else {
    user = ''
  }
  res.render('index', { title: 'DevLog', user: user })
})

module.exports = router
