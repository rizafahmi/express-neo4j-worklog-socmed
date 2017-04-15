const findOne = (node, key, value) => {
  return `MATCH (n:${node} {${key}: "${value}"}) return n LIMIT 1`
}

module.exports = {
  findOne
}
