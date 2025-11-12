const AuditLog = require("../models/DetailLog");

async function createAuditLog({ actorId, action, entity, entityId, data }) {
  try {
    await AuditLog.create({
      actorId,
      action,
      entity,
      entityId,
      data,
    });
  } catch (err) {
    console.error("Error creating audit log:", err.message);
  }
}

module.exports = createAuditLog;
