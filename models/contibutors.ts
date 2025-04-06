import mongoose from "mongoose";

const contributorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  resources: {
    type: Number,
    required: true,
  },
  github: {
    type: String,
  },
});

const Contributors =
  mongoose.models.Contributors ||
  mongoose.model("Contributors", contributorSchema);

export default Contributors;
