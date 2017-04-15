const express = require('express')
const bcrypt = require('bcryptjs')

const models = require('../models')
const router = express.Router()

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
  const username = req.body.username
  const password = req.body.password
  models.findUser(username)
    .then(user => {
      try {
        if (user.records.length > 0) {
          const message = `${username} is already exist.`
          req.flash('danger', message)
          res.render('register')
        } else {
          models.createUser(username, password)
            .then(result => {
              const message = 'User created!'
              req.flash('info', message)
              res.redirect('/')
            })
            .catch(() => {
              const message = 'Username already exist. Please do login instead.'
              req.flash('danger', message)
              res.render('register')
            })
        }
      } catch (err) {
        const message = `Ooops, something happen! ${err}`
        req.flash('danger', message)
        res.render('register')
      }
    })
    .catch(err => {
      const message = `Ooops, something happen! ${err}`
      req.flash('danger', message)
      res.redirect('/register')
    })
})

router.get('/login', (req, res, next) => {
  res.render('login')
})
router.post('/register', (req, res, next) => {
  res.send('TODO')
})

module.exports = router
