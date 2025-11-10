import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  subject: String,
  day: String,
  time: String,
});

const Class = mongoose.models.Class || mongoose.model("Class", classSchema);
export default Class;
