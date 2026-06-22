import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useWorkspaceStore, Environment, ProjectMember } from '../stores/useWorkspaceStore';
import { socketManager } from '../lib/socketClient';
import { apiClient } from '../lib/apiClient';
import { Card, Button, Input } from '@forge/ui';
import { motion, AnimatePresence } from 'framer-motion';

export const ProjectDashboardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const { 
    currentProject, 
    environments, 
    members, 
    fetchProjectDetails, 
    scaleEnvironment, 
    archiveProject, 
    restoreProject,
    useWorkspaceStoreState // Wait, we can fetch state from useWorkspaceStore
  } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'environments' | 'members' | 'activity' | 'settings'>('overview');
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  
  // Scaling Modal State
  const [scalingOpen, setScalingOpen] = useState(false);
  const [cpu, setCpu] = useState(0.5);
  const [memory, setMemory] = useState(512);
  const [storage, setStorage] = useState(1024);
  const [submittingScale, setSubmittingScale] = useState(false);
  
  // Config Import State
  const [configJson, setConfigJson] = useState('');
  const [importingConfig, setImportingConfig] = useState(false);
  
  // Real-time Activities State
  const [liveActivities, setLiveActivities] = useState<any[]>([]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails(projectId);
      
      // Load initial activities or setup mock timeline
      setLiveActivities([
        {
          _id: '1',
          action: 'project.created',
          actorName: 'System',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: { message: 'Project initialized and environments provisioned.' }
        }
      ]);
    }
  }, [projectId]);

  // Real-time socket events integration
  useEffect(() => {
    if (!projectId) return;

    // Connect to websocket gateway
    const socket = socketManager.connect();
    if (socket) {
      socket.emit('join:project', projectId);

      // Listen to real-time events
      socket.on('environment:status', (updatedEnv: Environment) => {
        if (updatedEnv.projectId === projectId) {
          fetchProjectDetails(projectId);
          addActivity({
            action: 'env.status_updated',
            actorName: 'Deployer',
            details: { message: `Environment ${updatedEnv.name} status updated to ${updatedEnv.status}.` }
          });
        }
      });

      socket.on('environment:scaled', (updatedEnv: Environment) => {
        if (updatedEnv.projectId === projectId) {
          fetchProjectDetails(projectId);
          addActivity({
            action: 'env.scaled',
            actorName: 'Operator',
            details: { message: `Scaled ${updatedEnv.name} resources: CPU ${updatedEnv.resources.cpu} cores, RAM ${updatedEnv.resources.memory} MB.` }
          });
        }
      });

      socket.on('activity:new', (activity: any) => {
        if (activity.projectId === projectId) {
          setLiveActivities((prev) => [activity, ...prev]);
        }
      });
    }

    return () => {
      if (socket) {
        socket.emit('leave:project', projectId);
        socket.off('environment:status');
        socket.off('environment:scaled');
        socket.off('activity:new');
      }
    };
  }, [projectId]);

  const addActivity = (act: { action: string; actorName: string; details: any }) => {
    const newAct = {
      _id: Math.random().toString(),
      action: act.action,
      actorName: act.actorName,
      timestamp: new Date().toISOString(),
      details: act.details
    };
    setLiveActivities((prev) => [newAct, ...prev]);
  };

  const handleScaleEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnv) return;
    setSubmittingScale(true);
    try {
      await scaleEnvironment(selectedEnv._id, { cpu, memory, storage });
      setScalingOpen(false);
    } catch (err: any) {
      // Handled in store alert
    } finally {
      setSubmittingScale(false);
    }
  };

  const openScaleModal = (env: Environment) => {
    setSelectedEnv(env);
    setCpu(env.resources.cpu);
    setMemory(env.resources.memory);
    setStorage(env.resources.storage);
    setScalingOpen(true);
  };

  const handleExportConfig = () => {
    if (!currentProject) return;
    const config = {
      framework: currentProject.framework,
      sourceControl: currentProject.sourceControl,
      settings: currentProject.settings
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.slug}-config.json`;
    a.click();
  };

  const handleImportConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    setImportingConfig(true);
    try {
      const parsed = JSON.parse(configJson);
      // Simulating API import
      await apiClient.post(`/v1/projects/${currentProject._id}/import`, parsed);
      alert('Configuration imported successfully!');
      fetchProjectDetails(currentProject._id);
      setConfigJson('');
    } catch (err: any) {
      alert('Invalid JSON config format: ' + err.message);
    } finally {
      setImportingConfig(false);
    }
  };

  if (!currentProject) {
    return <div style={{ color: 'var(--color-text-secondary)' }}>Loading project dashboard...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#fff' }}>{currentProject.name}</h1>
            <span style={{ 
              fontSize: '11px', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              backgroundColor: currentProject.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.1)',
              color: currentProject.status === 'ACTIVE' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: 600
            }}>
              {currentProject.status}
            </span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontFamily: 'monospace', fontSize: '13px' }}>
            {currentProject.sourceControl.repository} ({currentProject.sourceControl.branch})
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          ← Back to Projects
        </Button>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '24px' }}>
        {(['overview', 'environments', 'members', 'activity', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 4px',
              border: 'none',
              background: 'none',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab ? 600 : 500,
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            
            {/* Environments overview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>Environments Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {environments.map((env) => (
                  <Card key={env._id} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(16,16,16,0.3)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>
                          {env.name}
                        </span>
                        <span style={{ 
                          fontSize: '10px', 
                          padding: '1px 6px', 
                          borderRadius: '4px', 
                          backgroundColor: env.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                          color: env.status === 'ACTIVE' ? 'var(--color-primary)' : '#F59E0B'
                        }}>
                          {env.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                        Specs: {env.resources.cpu} Cores / {env.resources.memory} MB RAM / {env.resources.storage} MB Disk
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => openScaleModal(env)}>
                      Scale Resources
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick stats sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Card style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Project Info
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Framework:</span>
                    <span style={{ color: '#fff', textTransform: 'capitalize' }}>{currentProject.framework}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Default Branch:</span>
                    <span style={{ color: '#fff' }}>{currentProject.sourceControl.branch}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Team Members:</span>
                    <span style={{ color: '#fff' }}>{members.length}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'environments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>Isolated Environments</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {environments.map((env) => (
                <Card key={env._id} style={{ padding: '24px', backgroundColor: 'rgba(20,20,20,0.6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, textTransform: 'capitalize', fontSize: '18px', color: '#fff' }}>{env.name}</h4>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      backgroundColor: env.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: env.status === 'ACTIVE' ? 'var(--color-primary)' : '#F59E0B'
                    }}>
                      {env.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>CPU Share:</span>
                      <strong style={{ color: '#fff' }}>{env.resources.cpu} Cores</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>RAM Allocation:</span>
                      <strong style={{ color: '#fff' }}>{env.resources.memory} MB</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Disk Storage:</span>
                      <strong style={{ color: '#fff' }}>{env.resources.storage} MB</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="secondary" size="sm" style={{ flex: 1 }} onClick={() => openScaleModal(env)}>
                      Scale Resources
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>Project Members</h3>
            <Card style={{ padding: '0px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '16px' }}>User ID</th>
                    <th style={{ padding: '16px' }}>Role</th>
                    <th style={{ padding: '16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px', color: '#fff', fontFamily: 'monospace' }}>{member.userId}</td>
                      <td style={{ padding: '16px', color: 'var(--color-primary)' }}>{member.roleId}</td>
                      <td style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>{member.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {activeTab === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>Real-time Audit Log</h3>
            <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {liveActivities.map((act) => (
                <div key={act._id} style={{ display: 'flex', gap: '16px', borderLeft: '2px solid var(--color-primary)', paddingLeft: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <strong style={{ color: '#fff' }}>{act.action}</strong>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Actor: {act.actorName}
                    </div>
                    {act.details && act.details.message && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#fff' }}>{act.details.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>Danger Zone & Lifecycle</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* Lifecycle operations */}
              <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, color: '#fff' }}>Project Lifecycle</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Archive the project to pause environments billing, or restore it.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {currentProject.status === 'ACTIVE' ? (
                    <Button variant="secondary" onClick={() => archiveProject(currentProject._id)}>
                      Archive Project
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={() => restoreProject(currentProject._id)}>
                      Restore Project
                    </Button>
                  )}
                </div>
              </Card>

              {/* Export/Import Settings */}
              <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, color: '#fff' }}>Export / Import Config</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Export project layout structure config or upload a new one.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="secondary" onClick={handleExportConfig}>
                    Export Configuration
                  </Button>
                </div>

                <form onSubmit={handleImportConfig} style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea
                    placeholder="Paste config JSON here to import..."
                    value={configJson}
                    onChange={(e) => setConfigJson(e.target.value)}
                    style={{
                      height: '80px',
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      padding: '10px'
                    }}
                  />
                  <Button variant="primary" type="submit" isLoading={importingConfig} size="sm">
                    Import Config
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Scaling Modal */}
      <AnimatePresence>
        {scalingOpen && selectedEnv && (
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
                padding: '28px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px', color: 'var(--color-primary)', textTransform: 'capitalize' }}>
                Scale Environment: {selectedEnv.name}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
                Adjust system resources. Changes are subject to workspace quota limits.
              </p>

              <form onSubmit={handleScaleEnv} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input 
                  label="CPU Share (Cores)" 
                  type="number" 
                  step="0.1" 
                  min="0.1" 
                  max="4"
                  value={cpu}
                  onChange={(e) => setCpu(parseFloat(e.target.value))}
                  required
                />
                
                <Input 
                  label="RAM Allocation (MB)" 
                  type="number" 
                  step="128" 
                  min="128" 
                  max="4096"
                  value={memory}
                  onChange={(e) => setMemory(parseInt(e.target.value))}
                  required
                />

                <Input 
                  label="SSD Disk Storage (MB)" 
                  type="number" 
                  step="256" 
                  min="256" 
                  max="10240"
                  value={storage}
                  onChange={(e) => setStorage(parseInt(e.target.value))}
                  required
                />

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <Button variant="secondary" onClick={() => setScalingOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" isLoading={submittingScale}>
                    Scale Specs
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
