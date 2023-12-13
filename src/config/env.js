export const env = {
  mongodbAtalPassword: process.env.MONGO_ATAL_PASSWORD,
  port: process.env.PORT || 2022,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.DB_URI,
  jwtSecret: process.env.JWT_SECRET || "my_temporary_secret",
  oxylabxUsername: process.env.OXYLABS_USERNAME,
  oxylabsPassword: process.env.OXYLABS_PASSWORD,
  cronMinute: process.env.CRON_MINUTE || "*",
  cronHour: process.env.CRON_HOUR || "*",
  cronDayOfMonth: process.env.CRON_DAY_OF_MONTH || "*",
  cronMonth: process.env.CRON_MONTH || "*",
  cronDayOfWeek: process.env.CRON_DAY_OF_WEEK || "*",
};
