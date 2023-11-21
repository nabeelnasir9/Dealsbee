export const env = {
  mongodbAtalPassword: process.env.MONGO_ATAL_PASSWORD,
  port: process.env.PORT || 2022,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri:process.env.DB_URI,
  jwtSecret: process.env.JWT_SECRET || "my_temporary_secret"
};
