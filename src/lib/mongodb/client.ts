import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalForMongoose = globalThis as unknown as {
  mongoose: MongooseCache | undefined
}

const cached: MongooseCache = globalForMongoose.mongoose ?? { conn: null, promise: null }

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = cached
}

async function connectMongoDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectMongoDB
