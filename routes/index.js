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
  models.getLogs(user)
    .then(result => {
      res.render('index', {
        title: 'DevLog',
        user,
        logs: result.records
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

router.get('/like/:log_id', (req, res) => {
  if (res.locals.session.username) {
    models.likedLog(res.locals.session.username, req.params.log_id)
    .then(result => {
      req.flash('info', 'You liked it!')
      console.log(req.originalUrl)
      res.redirect('/')
    })
    .catch(err => console.error(err))
  } else {
    req.flash('danger', 'You have to login first.')
    res.redirect('/login')
  }
})

router.get('/logout', (req, res) => {
  res.locals.session.username = ''
  req.flash('info', 'You\'re logged out!')
  res.redirect('/')
})

router.get('/profile/:username', (req, res) => {
  if (res.locals.session.username) {
    models.getUserRecentLogs(res.locals.session.username)
      .then(result => {
        console.log(result)
        res.render('profile', {
          logs: result.records
        })
      })
      .catch(err => console.error(err))
  } else {
    req.flash('danger', 'You need to login to access profile page')
    res.redirect('/login')
  }
})

module.exports = router
