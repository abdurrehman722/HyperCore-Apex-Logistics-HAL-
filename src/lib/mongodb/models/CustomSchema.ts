import mongoose, { Schema, Document } from 'mongoose'

export interface ICustomSchema extends Document {
  name: string
  description?: string
  provider: 'postgresql' | 'mongodb'
  fields: Array<{
    name: string
    type: 'String' | 'Number' | 'Boolean' | 'Date' | 'ObjectId' | 'Array'
    required: boolean
    unique: boolean
    default?: string
    ref?: string
  }>
  createdBy: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const FieldSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['String', 'Number', 'Boolean', 'Date', 'ObjectId', 'Array'] },
  required: { type: Boolean, default: false },
  unique: { type: Boolean, default: false },
  default: { type: String },
  ref: { type: String },
})

const CustomSchemaModel = new Schema<ICustomSchema>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    provider: { type: String, required: true, enum: ['postgresql', 'mongodb'] },
    fields: [FieldSchema],
    createdBy: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.CustomSchema ||
  mongoose.model<ICustomSchema>('CustomSchema', CustomSchemaModel)
