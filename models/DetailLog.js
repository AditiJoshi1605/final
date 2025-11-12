const mongoose = require("mongoose");

const detailLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    data: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", detailLogSchema);
