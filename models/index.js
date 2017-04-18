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
session.run('CREATE CONSTRAINT ON (n:Log) ASSERT n.id IS UNIQUE')
  .then((result) => {
    console.log('Constraint for Log created.')
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

const addLog = async (log, tags, username) => {
  const id = uuid()

  let q = `MATCH (u:User {username: '${username}'})
        MERGE (u)-[r:PUBLISHED]->(l:Log {id: '${id}', log: '${log}', timestamp: timestamp()})`

  return await session.run(q)
    .then(result => {
      if (tags.trim().length > 0) {
        return tags.split(',').map(tag => {
          q = `MERGE (t:Tag {name: '${tag.trim()}'})`
          session.run(q)
            .then(result => {
              const relQ = `MATCH (t:Tag {name: '${tag.trim()}'}),
                (l:Log {id: '${id}'})
                MERGE (t)-[r:TAGGED]->(l)`
              return session.run(relQ)
            })
            .catch(err => console.error(err))
        })
      }
    })
}

const getUserRecentLogs = async (username) => {
  const q = `
      MATCH (user)-[:PUBLISHED]->(log)<-[:TAGGED]-(tag)
      WHERE user.username = '${username}'
      RETURN user.username, log.log, COLLECT(tag.name) AS tags, log.id, log.timestamp
      ORDER BY log.timestamp DESC
    `
  return await session.run(q)
}

const getLogs = async () => {
  const q = `
      MATCH (user)-[:PUBLISHED]->(log)<-[:TAGGED]-(tag)
      RETURN user.username, log.log, COLLECT(tag.name) AS tags, log.id, log.timestamp
      ORDER BY log.timestamp DESC LIMIT 25
    `
  return await session.run(q)
}

const likedLog = async (username, logId) => {
  const relQ = `MATCH (u:User {username: '${username}'}),
                (l:Log {id: '${logId}'})
                MERGE (u)-[r:LIKED]->(l)`
  console.log(relQ)
  return await session.run(relQ)
}

const similarUser = async (username, n = 5) => {
  const q = `MATCH (user1:User)-[:PUBLISHED]->(:Log)<-[:TAGGED]-(tag:Tag),
    (user2:User)-[:PUBLISHED]->(:Log)<-[:TAGGED]-(tag)
    WHERE user1.username = '${username}' AND user1 <> user2
    WITH user2, COLLECT(DISTINCT tag.name) AS tags, COUNT(DISTINCT tag.name) AS tag_count
    ORDER BY tag_count DESC LIMIT ${n}
    RETURN user2.username AS similar_user, tags`
  return await session.run(q)
}

module.exports = {
  findUser,
  createUser,
  loggingIn,
  addLog,
  getUserRecentLogs,
  likedLog,
  getLogs,
  similarUser
}
