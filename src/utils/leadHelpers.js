export const getLeadName = lead => lead?.customerName || lead?.name || 'Untitled lead';
export const getLeadMobile = lead => lead?.mobile || lead?.phone || '';
export const getLeadEmail = lead => lead?.email || '';
export const getLeadProjectName = lead => lead?.interestedProject?.projectName || lead?.interestedProject?.name || lead?.project?.projectName || lead?.project?.name || lead?.project || '—';
export const getLeadOwnerName = lead => lead?.assignedTo?.name || lead?.assignedTo || 'Unassigned';
export const getLeadStatus = lead => lead?.status || 'New';
