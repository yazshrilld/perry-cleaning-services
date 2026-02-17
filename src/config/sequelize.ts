// // import { connect, connection } from "mongoose";


// import { Sequelize, Dialect } from "sequelize";
// import { logger } from "netwrap";
// import { getters } from "./getters";

// // server connection settings

// const postGressConnectionString = getters.getDatabaseUrl().HOST;
// const idle = parseInt(getters.getDatabaseUrl().IDLE); // default 10s if not defined
// const dialectType = getters.getDatabaseUrl().DIALECT as Dialect; // default 'postgres' if not defined
// export const PostgresSequelizeInstance = new Sequelize(postGressConnectionString, {
//   dialect: dialectType,
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false,
//     },
//     connectTimeout: parseInt(getters.getDatabaseUrl().ACQUIRE),
//   },
//   pool: {
//     max: parseInt(getters.getDatabaseUrl().MAX),
//     min: parseInt(getters.getDatabaseUrl().MIN),
//     acquire: parseInt(getters.getDatabaseUrl().ACQUIRE),
//     idle, // parsed as number
//   },
//   define: {
//     timestamps: true,
//     freezeTableName: true,
//   },
//   logging: console.log,
// });

// const connectDB = async (
//   sequelizeInstance: Sequelize,
//   dbType: string,
//   retries = 15000
// ) => {
//   logger(`Connecting to ${dbType} database....`, {
//     shouldLog: true,
//     isError: false,
//   });
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       await sequelizeInstance.authenticate();
//       logger(
//         `${dbType} Database connection successful....`,
//         {
//           shouldLog: true,
//           isError: false,
//         },
//       );
//       return;
//     } catch (err) {
//       logger(
//         `Attempt ${attempt} -
//          Unable to connect to ${dbType} database`,
//         {
//           shouldLog: true,
//           isError: true,
//         }
//       );
//       logger((err as Error).message || String(err));

//       // If last attempt, throw error
//       if (attempt === retries) {
//         throw new Error(
//           `Failed to connect to ${dbType} 
//           database after ${retries} attempts`
//         );
//       }

//       // Wait before retrying
//       await new Promise((res) => setTimeout(res, 2000));
//     }
//   }
// };


// const postgresLoader = async () =>
//   await connectDB(PostgresSequelizeInstance, "PostgreSQL DB");

// export const DBconnect = {postgresLoader, PostgresSequelizeInstance };

export {};