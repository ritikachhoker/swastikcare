import mongoose from "mongoose";

const connectDB = async ()=>{

    mongoose.connection.on('connected',()=> console.log("Database Connected"))
   await mongoose.connect(`${process.env.MONGODB_URI}/swastikcare`)
}
export default connectDB
// import mongoose from "mongoose";

// const connectDB = async () => {
//     try {
//         // Listen for connection events
//         mongoose.connection.on('connected', () => {
//             console.log("Database Connected");
//         });

//         mongoose.connection.on('error', (err) => {
//             console.error("Database connection error:", err);
//         });

//         mongoose.connection.on('disconnected', () => {
//             console.log("Database Disconnected");
//         });

//         // Connect to MongoDB
//         await mongoose.connect(`${process.env.MONGODB_URI}/swastikcare`, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });

//         console.log("MongoDB connection established successfully.");
//     } catch (error) {
//         console.error("MongoDB connection failed:", error);
//         process.exit(1); // Exit the process with failure
//     }
// };

// export default connectDB;