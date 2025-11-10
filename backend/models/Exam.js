import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  subject: String,
  date: String,
  time: String,
});

const Exam = mongoose.models.Exam || mongoose.model("Exam", examSchema);
export default Exam;
