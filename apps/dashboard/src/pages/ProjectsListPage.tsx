import React, { useState } from 'react';
import { useWorkspaceStore, Project } from '../stores/useWorkspaceStore';
import { Card, Button, Input } from '@forge/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';

export const ProjectsListPage: React.FC = () => {
  const { 
    projects, 
    currentWorkspace, 
    createProject, 
    quota, 
    deleteProject, 
    cloneProject, 
    workspaces 
  } = useWorkspaceStore();
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  
  // Wizard States
  const [name, setName] = useState('');
  const [repository, setRepository] = useState('');
  const [framework, setFramework] = useState('nextjs');
  const [branch, setBranch] = useState('main');
  const [submitting, setSubmitting] = useState(false);
  const [cloneTargetProject, setCloneTargetProject] = useState<Project | null>(null);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneTargetWsId, setCloneTargetWsId] = useState('');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    setSubmitting(true);
    try {
      const result = await createProject({
        workspaceId: currentWorkspace._id,
        name,
        repository,
        framework,
        branch,
      });
      setWizardOpen(false);
      setName('');
      setRepository('');
      setFramework('nextjs');
      setBranch('main');
      // Navigate to project dashboard
      navigate(`/dashboard/projects/${result.project._id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloneProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneTargetProject || !cloneTargetWsId) return;
    setSubmitting(true);
    try {
      await cloneProject(cloneTargetProject._id, cloneTargetWsId);
      setCloneOpen(false);
      setCloneTargetProject(null);
    } catch (err: any) {
      alert(err.message || 'Failed to clone project');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Quota Warning Banner
  const isNearLimit = quota 
    ? (quota.usage.projects / quota.limits.maxProjects) >= 0.8 
    : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Quota Banner */}
      {isNearLimit && quota && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#FCA5A5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
          }}
        >
          <div>
            <strong>⚠️ Quota Warning:</strong> Your workspace is near its limit of projects ({quota.usage.projects} of {quota.limits.maxProjects} used). Upgrade to increase limits.
          </div>
          <Button variant="secondary" size="sm" style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#fff' }}>
            Upgrade
          </Button>
        </motion.div>
      )}

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#fff' }}>Projects</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Manage and deploy your applications in {currentWorkspace?.name || 'your workspace'}.
          </p>
        </div>
        <Button 
          variant="primary" 
          disabled={!currentWorkspace}
          onClick={() => setWizardOpen(true)}
          style={{
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
            border: '1px solid var(--color-primary)'
          }}
        >
          + New Project
        </Button>
      </div>

      {/* Workspace Resource Summary Card */}
      {quota && (
        <Card style={{ padding: '20px', backgroundColor: 'rgba(16,16,16,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
            Workspace Resource Usage
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Projects</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                {quota.usage.projects} <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>/ {quota.limits.maxProjects}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>CPU Cores</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                {quota.usage.cpuCores} <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>/ {quota.limits.maxCpuCores}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Memory Allocation</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                {quota.usage.memoryMB} <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>MB / {quota.limits.maxMemoryMB} MB</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Storage Used</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                {quota.usage.storageGB.toFixed(1)} <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>GB / {quota.limits.maxStorageGB} GB</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filter / Search */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <Input 
            placeholder="Search projects by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid List */}
      <motion.div 
        layout
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.div
              key={project._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                style={{ 
                  padding: '24px', 
                  backgroundColor: 'rgba(20, 20, 20, 0.6)', 
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.3s, box-shadow 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => navigate(`/dashboard/projects/${project._id}`)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                      {project.name}
                    </h2>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      backgroundColor: project.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.1)',
                      color: project.status === 'ACTIVE' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontWeight: 600
                    }}>
                      {project.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px', marginBottom: '16px', minHeight: '40px' }}>
                    {project.description || 'No description provided.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ opacity: 0.6 }}>Framework:</span>
                      <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{project.framework}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ opacity: 0.6 }}>Repository:</span>
                      <span style={{ color: '#fff', fontFamily: 'monospace' }}>{project.sourceControl.repository}</span>
                    </div>
                  </div>
                </div>

                <div 
                  style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}
                  onClick={(e) => e.stopPropagation()} // Stop navigation trigger
                >
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    style={{ flex: 1 }}
                    onClick={() => {
                      setCloneTargetProject(project);
                      setCloneTargetWsId(currentWorkspace?._id || '');
                      setCloneOpen(true);
                    }}
                  >
                    Clone
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    style={{ flex: 1, borderColor: 'rgba(239,68,68,0.2)', color: '#EF4444' }}
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${project.name}?`)) {
                        deleteProject(project._id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
            <h3 style={{ fontSize: '18px', color: '#fff' }}>No Projects Found</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
              Create a project or try adjusting your search terms.
            </p>
          </div>
        )}
      </motion.div>

      {/* Project Creation Wizard Modal */}
      <AnimatePresence>
        {wizardOpen && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            backdropFilter: 'blur(6px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 100 
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              style={{
                width: '100%',
                maxWidth: '500px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-primary)' }}>
                Create New Project
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                Setup a new software project attached to your workspace.
              </p>

              <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input 
                  label="Project Name" 
                  placeholder="my-cool-webapp" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                
                <Input 
                  label="Git Repository Path" 
                  placeholder="e.g. owner/repo" 
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                  required
                />

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Framework</label>
                    <select 
                      value={framework}
                      onChange={(e) => setFramework(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        backgroundColor: 'var(--color-background)',
                        border: '1px solid var(--color-border)',
                        color: '#fff',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    >
                      <option value="nextjs">Next.js</option>
                      <option value="vite">Vite (React)</option>
                      <option value="svelte">Svelte</option>
                      <option value="remix">Remix</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input 
                      label="Default Branch" 
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <Button variant="secondary" onClick={() => setWizardOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" isLoading={submitting}>
                    Create Project
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clone Project Modal */}
      <AnimatePresence>
        {cloneOpen && cloneTargetProject && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            backdropFilter: 'blur(6px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 100 
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: '450px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px', color: 'var(--color-primary)' }}>
                Clone Project: {cloneTargetProject.name}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                Clone this project and all its configurations.
              </p>

              <form onSubmit={handleCloneProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Target Workspace</label>
                  <select 
                    value={cloneTargetWsId}
                    onChange={(e) => setCloneTargetWsId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      color: '#fff',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    {workspaces.map((ws) => (
                      <option key={ws._id} value={ws._id}>{ws.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <Button variant="secondary" onClick={() => setCloneOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" isLoading={submitting}>
                    Clone
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
