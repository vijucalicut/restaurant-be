const { getCollections } = require('../config/database');

/**
 * Audit Log Service
 * Tracks all operations with admin_id, timestamps, and action details
 */

const AuditActions = {
  RESTAURANT_CREATED: 'RESTAURANT_CREATED',
  RESTAURANT_UPDATED: 'RESTAURANT_UPDATED',
  RESTAURANT_DELETED: 'RESTAURANT_DELETED',
  TABLE_CREATED: 'TABLE_CREATED',
  TABLE_UPDATED: 'TABLE_UPDATED',
  TABLE_DELETED: 'TABLE_DELETED',
  TIMESLOT_CREATED: 'TIMESLOT_CREATED',
  TIMESLOT_UPDATED: 'TIMESLOT_UPDATED',
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_STATUS_UPDATED: 'BOOKING_STATUS_UPDATED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  QUEUE_ENTRY_CREATED: 'QUEUE_ENTRY_CREATED',
  QUEUE_ENTRY_PROMOTED: 'QUEUE_ENTRY_PROMOTED',
  ADMIN_CREATED: 'ADMIN_CREATED',
};

async function logAudit(action, adminId, restaurantId, details = {}) {
  try {
    const { audit_logs } = getCollections();

    const auditEntry = {
      _id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      action,
      adminId: adminId || null,
      restaurantId: restaurantId || null,
      details: {
        ...details,
        ipAddress: details.ipAddress || null,
        userAgent: details.userAgent || null
      },
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    };

    await audit_logs.insertOne(auditEntry);
    console.log(`📋 Audit: [${action}] Admin: ${adminId} | Restaurant: ${restaurantId}`);

    return auditEntry;
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}

async function getAuditLogs(filters = {}) {
  try {
    const { audit_logs } = getCollections();

    const query = {};
    if (filters.adminId) query.adminId = filters.adminId;
    if (filters.restaurantId) query.restaurantId = filters.restaurantId;
    if (filters.action) query.action = filters.action;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const logs = await audit_logs.find(query).sort({ timestamp: -1 }).toArray();
    return logs;
  } catch (error) {
    console.error('Get audit logs error:', error);
    return [];
  }
}

module.exports = {
  logAudit,
  getAuditLogs,
  AuditActions
};
