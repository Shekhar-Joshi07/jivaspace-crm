import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import LeadForm from '../components/LeadForm';
import Loader from '../components/Loader';
import { PageHeader } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { leadService } from '../services/leadService';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { ADMIN_ROLES, canManageLeads } from '../utils/constants';

const canAssignLead = role => ADMIN_ROLES.includes(role);

export default function CreateLead() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      userService.list({ limit: 200, isActive: true }),
      projectService.list({ limit: 200 })
    ]).then(([usersResult, projectsResult]) => {
      if (!alive) return;
      setUsers(usersResult.status === 'fulfilled' ? usersResult.value.users : []);
      setProjects(projectsResult.status === 'fulfilled' ? projectsResult.value.projects : []);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const submit = async payload => {
    setBusy(true);
    try {
      const lead = await leadService.create(payload);
      toast.success('Lead created');
      navigate(`/leads/${lead._id || lead.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader fullPage label="Preparing lead form…" />;
  if (!canManageLeads(user?.role)) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          eyebrow="Lead Management"
          title="Create Lead"
          description="You do not have permission to create leads."
        />
        <Link className="btn-secondary" to="/leads"><ArrowLeft size={17} /> Back to leads</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link className="btn-secondary" to="/leads"><ArrowLeft size={17} /> Back to leads</Link>
      </div>
      <section className="card p-5 sm:p-6">
        <PageHeader
          eyebrow="Lead Management"
          title="Create Lead"
          description="Capture a new real-estate opportunity with customer, project, and follow-up information."
        />
        <LeadForm
          busy={busy}
          canAssign={canAssignLead(user?.role)}
          onSubmit={submit}
          projects={projects}
          users={users}
        />
        <div className="mt-6 flex justify-end">
          <button className="btn-primary" disabled={busy} form="lead-form" type="submit">
            <Save size={17} />
            {busy ? 'Saving…' : 'Save lead'}
          </button>
        </div>
      </section>
    </div>
  );
}
