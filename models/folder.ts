import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
  name: String,
  children: [mongoose.Schema.Types.Mixed],
});

const Folder = mongoose.models.Folder || mongoose.model("Folder", folderSchema);

export default Folder;
