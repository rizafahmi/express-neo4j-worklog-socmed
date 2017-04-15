var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', (req, res, next) => {
  let user
  if (req.session) {
    user = req.session.user
  } else {
    user = ''
  }
  res.render('index', { title: 'DevLog', user: user })
})
router.get('/register', (req, res, next) => {
  res.render('register')
})
router.post('/register', (req, res, next) => {
  res.send(`${req.body.username} ${req.body.password}`)
})

router.get('/login', (req, res, next) => {
  res.render('login')
})
router.post('/register', (req, res, next) => {
  res.send('TODO')
})

module.exports = router
