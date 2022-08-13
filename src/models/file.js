import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },

    filename: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("file", fileSchema);

export default File;
