import mongoose, { Schema, type Document } from 'mongoose';

export interface ICurriculumUnit {
  unitNo: number;
  unitTitle: string;
  weightageMarks: number;
  topics: string[];
}

export interface CurriculumDocument extends Document {
  department: string;
  scheme: 'K-Scheme (Latest)' | 'I-Scheme' | 'Revised';
  semester: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  theoryMarks: number;
  pt1Marks: number;
  pt2Marks: number;
  practicalMarks: number;
  units: ICurriculumUnit[];
  syllabusPdfUrl?: string;
  isLatestScheme: boolean;
  createdByRole: 'TEACHER' | 'ADMIN';
  createdBy?: Schema.Types.ObjectId;
}

const curriculumSchema = new Schema<CurriculumDocument>(
  {
    department: { type: String, default: 'Computer Engineering', required: true, index: true },
    scheme: {
      type: String,
      enum: ['K-Scheme (Latest)', 'I-Scheme', 'Revised'],
      default: 'K-Scheme (Latest)',
      required: true,
      index: true,
    },
    semester: { type: Number, required: true, min: 1, max: 6, index: true },
    subjectCode: { type: String, required: true, trim: true },
    subjectName: { type: String, required: true, trim: true },
    credits: { type: Number, default: 4 },
    theoryMarks: { type: Number, default: 70 },
    pt1Marks: { type: Number, default: 20 },
    pt2Marks: { type: Number, default: 20 },
    practicalMarks: { type: Number, default: 50 },
    units: [
      {
        unitNo: { type: Number, required: true },
        unitTitle: { type: String, required: true },
        weightageMarks: { type: Number, default: 12 },
        topics: { type: [String], default: [] },
      },
    ],
    syllabusPdfUrl: { type: String },
    isLatestScheme: { type: Boolean, default: true },
    createdByRole: { type: String, enum: ['TEACHER', 'ADMIN'], default: 'TEACHER' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

curriculumSchema.index({ department: 1, scheme: 1, semester: 1 });

export const Curriculum = mongoose.model<CurriculumDocument>('Curriculum', curriculumSchema);
