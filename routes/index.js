const express = require('express')

const models = require('../models')
const router = express.Router()

/* GET home page. */
router.get('/', (req, res, next) => {
  let user
  if (res.locals.session) {
    user = res.locals.session.username
  } else {
    user = ''
  }
  models.getUserLogs(user)
    .then(result => {
      const logs = result.records.map(log => {
        return log._fields[0].properties
      })
      res.render('index', {
        title: 'DevLog',
        user: user,
        logs: logs
      })

    })
    .catch(err => console.error(err))
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
      res.render('register')
    })
})

router.get('/login', (req, res, next) => {
  res.render('login')
})
router.post('/login', (req, res, next) => {
  const { username, password } = req.body
  models.loggingIn(username, password)
    .then(result => {
      if (result === true) {
        const message = 'Successfully logged in.'
        req.session.username = username
        req.flash('info', message)
        res.redirect('/')
      } else {
        const message = `Invalid username or password.`
        req.flash('danger', message)
        res.render('login')
      }
    })
    .catch(error => {
      const message = `Something went wrong. ${error}`
      req.flash('danger', message)
      res.render('login')
    })
})

router.post('/add_log', (req, res, next) => {
  if (req.session.username) {
    models.addLog(req.body.log, req.body.tags, req.session.username)
      .then(result => {
        req.flash('info', 'Successfully log.')
        res.redirect('/')
      })
      .catch(err => {
        req.flash('danger', `Something wrong: ${err}`)
        res.redirect('/')
      })
  } else {
    req.flash('info', 'You need to logged in to post a log.')
    res.redirect('/')
  }
})

module.exports = router
