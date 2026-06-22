import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input } from '@forge/ui';

export const TopNavigation: React.FC = () => {
  const { setSidebarExpanded, sidebarExpanded, setCommandPaletteOpen } = useAppStore();
  const { workspaces, currentWorkspace, setCurrentWorkspace, createWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const { logout, user } = useAuthStore();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setCreating(true);
    try {
      const newWs = await createWorkspace(newWsName);
      setCurrentWorkspace(newWs);
      setNewWsName('');
      setModalOpen(false);
    } catch (err) {
      alert(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <header style={{ 
        height: '64px', 
        borderBottom: '1px solid var(--color-border)', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 24px', 
        backgroundColor: 'var(--color-surface)',
        position: 'relative',
        zIndex: 40
      }}>
        <button 
          onClick={() => setSidebarExpanded(!sidebarExpanded)} 
          style={{ marginRight: '16px', background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: '18px' }}
        >
          ☰
        </button>
        
        <div style={{ fontWeight: 'bold', fontSize: '18px', marginRight: '24px', color: 'var(--color-primary)', letterSpacing: '0.5px' }}>
          ForgeCloud
        </div>

        {/* Workspace Selector */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '6px 12px', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: 'var(--color-background)', 
              border: '1px solid var(--color-border)', 
              color: 'var(--color-text-primary)', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'border-color 0.2s'
            }}
          >
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
            {currentWorkspace ? currentWorkspace.name : 'Select Workspace'}
            <span style={{ fontSize: '10px', opacity: 0.7 }}>▼</span>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <>
                <div 
                  onClick={() => setDropdownOpen(false)} 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
                />
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  style={{ 
                    position: 'absolute', 
                    top: '40px', 
                    left: 0, 
                    width: '220px', 
                    backgroundColor: 'var(--color-surface)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: 'var(--radius-md)', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    padding: '8px 0',
                    zIndex: 20
                  }}
                >
                  <div style={{ padding: '6px 16px', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Workspaces
                  </div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws._id}
                      onClick={() => {
                        setCurrentWorkspace(ws);
                        setDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        background: 'none',
                        border: 'none',
                        color: currentWorkspace?._id === ws._id ? 'var(--color-primary)' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {ws.name}
                      {currentWorkspace?._id === ws._id && <span>✓</span>}
                    </button>
                  ))}
                  
                  <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }} />
                  
                  <button
                    onClick={() => {
                      setModalOpen(true);
                      setDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    + Create Workspace
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div style={{ flex: 1 }}></div>
        
        <button 
          onClick={() => setCommandPaletteOpen(true)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: 'var(--radius-sm)', 
            backgroundColor: 'var(--color-background)', 
            border: '1px solid var(--color-border)', 
            color: 'var(--color-text-secondary)', 
            cursor: 'pointer', 
            marginRight: '16px',
            fontSize: '13px'
          }}
        >
          Search... (⌘K)
        </button>

        {/* User Account / Logout */}
        <button 
          onClick={() => { if(confirm('Logout from ForgeCloud?')) logout(); }}
          title="Click to logout"
          style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--color-primary)', 
            color: '#000',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {user?.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
        </button>
      </header>

      {/* Create Workspace Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.75)', 
            backdropFilter: 'blur(4px)',
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
                maxWidth: '400px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px', color: 'var(--color-primary)' }}>
                New Workspace
              </h3>
              <form onSubmit={handleCreateWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input 
                  label="Workspace Name" 
                  placeholder="e.g. Acme Org" 
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  required
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" isLoading={creating}>
                    Create
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

