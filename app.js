const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const pug = require('pug')
const neo4j = require('neo4j-driver').v1
const session = require('cookie-session')

const index = require('./routes/index')
const models = require('./models')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const secret = 'neo4'
app.use(session({
  secret: secret,
  saveUninitialized: true,
  resave: false,
  cookie: {
    secureProxy: true,
    httpOnly: true
  }
}))
app.use(require('flash')())
app.use((req, res, next) => {
  res.locals.session = req.session
  next()
})

app.use('/', index)

require('express-debug')(app, {})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
