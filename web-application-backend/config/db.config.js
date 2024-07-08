module.exports = {
  HOST: "localhost",
  USER: "jv",
  PASSWORD: "1234",
  DB: "aquatrust", // create aquatrust db on your local
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000, //maximum time in milliseconds that pool will try to get connection before throwing error
    idle: 10000 //maximum time in milliseconds that a connection can be idle before being released
  }
};