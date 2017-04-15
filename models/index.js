const neo4j = require('neo4j-driver').v1
const bcrypt = require('bcryptjs')
const uuid = require('uuid/v4')

const neoHelpers = require('../lib/neo_helpers.js')

const driver = neo4j.driver('bolt://localhost')
const session = driver.session()

// Constraint creator
session.run('CREATE CONSTRAINT ON (n:User) ASSERT n.username IS UNIQUE')
  .then((result) => {
    console.log('Constraint for User created.')
    session.close()
  })
  .catch(error => {
    console.log(error)
  })
session.run('CREATE CONSTRAINT ON (n:Post) ASSERT n.id IS UNIQUE')
  .then((result) => {
    console.log('Constraint for Post created.')
    session.close()
  })
  .catch(error => {
    console.log(error)
  })
session.run('CREATE CONSTRAINT ON (n:Tag) ASSERT n.name IS UNIQUE')
  .then((result) => {
    console.log('Constraint for Tag created.')
    session.close()
  })
  .catch(error => {
    console.log(error)
  })

async function findUser (username) {
  let user
  try {
    user = await session.run(neoHelpers.findOne('User', 'username', username))
    session.close()
  } catch (err) {
    console.error(err)
  }
  return user
}

const createUser = (username, password) => {
  const salt = bcrypt.genSaltSync(10)
  const hashPassword = bcrypt.hashSync(password, salt)
  const q = `CREATE (u:User {username: '${username}', password: '${hashPassword}'})`
  return session.run(q)
}

const loggingIn = async (username, password) => {
  return await findUser(username)
    .then(result => {
      if (result.records && result.records.length > 0) {
        const userData = result.records[0]._fields[0].properties
        return bcrypt.compareSync(password, userData.password)
      } else {
        return false
      }
    })
    .catch(() => {
      return false
    })
}

module.exports = {
  findUser,
  createUser,
  loggingIn
}