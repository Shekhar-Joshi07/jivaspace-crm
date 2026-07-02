import assert from 'node:assert/strict';
import test from 'node:test';
import { canManageLeads, canViewReports } from '../src/utils/constants.js';
import { formatCurrency, isOverdue, toDateInput } from '../src/utils/formatDate.js';

test('role helpers match the CRM permission model', () => {
  assert.equal(canManageLeads('business_executive'), true);
  assert.equal(canManageLeads('support_staff'), false);
  assert.equal(canViewReports('superadmin'), true);
  assert.equal(canViewReports('admin'), true);
  assert.equal(canViewReports('business_executive'), false);
});

test('date helpers produce form values and overdue state', () => {
  assert.match(toDateInput(new Date('2026-06-28T12:00:00Z')), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(isOverdue('2020-01-01', 'Pending'), true);
  assert.equal(isOverdue('2020-01-01', 'Completed'), false);
});

test('currency values use INR formatting', () => {
  const value = formatCurrency(125000);
  assert.match(value, /₹/);
  assert.match(value, /1,25,000/);
});
