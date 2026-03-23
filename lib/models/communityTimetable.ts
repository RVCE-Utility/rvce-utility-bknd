import mongoose from "mongoose";
import { courseSchema, eventSchema, timeSlotSchema } from "./attendance";

const communityTimeTableSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    createdYear: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    publishedByEmail: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    publishedByName: {
      type: String,
      required: true,
      trim: true,
    },
    sourceTimeTableId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["published", "hidden"],
      default: "published",
      index: true,
    },
    voteScore: {
      type: Number,
      default: 0,
      index: true,
    },
    upvoteCount: {
      type: Number,
      default: 0,
    },
    downvoteCount: {
      type: Number,
      default: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
      index: true,
    },
    importCount: {
      type: Number,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    timeTable: {
      timeSlots: {
        type: [timeSlotSchema],
        default: [],
      },
      courses: {
        type: [courseSchema],
        default: [],
      },
      events: {
        type: [eventSchema],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  },
);

communityTimeTableSchema.index({
  semester: 1,
  branch: 1,
  section: 1,
  createdYear: 1,
  status: 1,
});
communityTimeTableSchema.index({ voteScore: -1, lastActivityAt: -1 });
communityTimeTableSchema.index(
  { publishedByEmail: 1, sourceTimeTableId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sourceTimeTableId: { $type: "string", $gt: "" },
    },
  },
);

const communityTimetableVoteSchema = new mongoose.Schema(
  {
    timetableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityTimeTable",
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    vote: {
      type: Number,
      enum: [1, -1],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
communityTimetableVoteSchema.index(
  { timetableId: 1, userEmail: 1 },
  { unique: true },
);

const communityTimetableReportSchema = new mongoose.Schema(
  {
    timetableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityTimeTable",
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    comment: {
      type: String,
      default: "",
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
  },
  {
    timestamps: true,
  },
);
communityTimetableReportSchema.index(
  { timetableId: 1, userEmail: 1 },
  { unique: true },
);

const CommunityTimeTable =
  mongoose.models.CommunityTimeTable ||
  mongoose.model("CommunityTimeTable", communityTimeTableSchema);

const CommunityTimeTableVote =
  mongoose.models.CommunityTimeTableVote ||
  mongoose.model("CommunityTimeTableVote", communityTimetableVoteSchema);

const CommunityTimeTableReport =
  mongoose.models.CommunityTimeTableReport ||
  mongoose.model("CommunityTimeTableReport", communityTimetableReportSchema);

export { CommunityTimeTable, CommunityTimeTableVote, CommunityTimeTableReport };
