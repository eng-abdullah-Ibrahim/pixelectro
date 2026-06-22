"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type TaskStatus = 'running' | 'success' | 'error';

export interface BackgroundTask {
  id: string;
  name: string;
  progress: number;
  status: TaskStatus;
  message?: string;
}

interface TaskContextType {
  tasks: BackgroundTask[];
  addTask: (id: string, name: string) => void;
  updateTaskProgress: (id: string, progress: number) => void;
  updateTaskStatus: (id: string, status: TaskStatus, message?: string) => void;
  removeTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within a TaskProvider");
  return context;
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<BackgroundTask[]>([]);
  const [minimized, setMinimized] = useState(false);

  const addTask = useCallback((id: string, name: string) => {
    setTasks(prev => {
      // Avoid duplicates
      if (prev.find(t => t.id === id)) return prev;
      return [...prev, { id, name, progress: 0, status: 'running' }];
    });
    setMinimized(false);
  }, []);

  const updateTaskProgress = useCallback((id: string, progress: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, progress } : t));
  }, []);

  const updateTaskStatus = useCallback((id: string, status: TaskStatus, message?: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, progress: status === 'success' ? 100 : t.progress, message } : t));
    
    // Auto-remove success/error tasks after a few seconds
    if (status === 'success' || status === 'error') {
      setTimeout(() => {
        removeTask(id);
      }, 5000);
    }
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fake progress simulator for running tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.status === 'running' && task.progress < 90) {
          // Slow down progress as it gets closer to 90
          const increment = Math.max(0.5, (90 - task.progress) * 0.05);
          return { ...task, progress: Math.min(90, task.progress + increment) };
        }
        return task;
      }));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTaskProgress, updateTaskStatus, removeTask }}>
      {children}
      
      {/* Floating Task UI */}
      {tasks.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '320px',
          backgroundColor: '#1E1E1E',
          border: '1px solid #333',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          zIndex: 999999,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'hidden',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: minimized ? 'translateY(calc(100% - 48px))' : 'translateY(0)'
        }}>
          <div 
            style={{
              padding: '12px 16px',
              backgroundColor: '#252525',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => setMinimized(!minimized)}
          >
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
              Background Tasks ({tasks.length})
            </div>
            <button 
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px' }}
              onClick={(e) => { e.stopPropagation(); setMinimized(!minimized); }}
            >
              {minimized ? '▲' : '▼'}
            </button>
          </div>
          
          <div style={{ padding: '8px 16px', maxHeight: '300px', overflowY: 'auto' }}>
            {tasks.map(task => (
              <div key={task.id} style={{ margin: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#eee', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.name}
                  </span>
                  <span style={{ color: task.status === 'error' ? '#ff4d4f' : task.status === 'success' ? '#52c41a' : '#888', fontSize: '12px', fontWeight: 500, marginLeft: '8px' }}>
                    {task.status === 'running' ? `${Math.floor(task.progress)}%` : task.status === 'success' ? 'Done' : 'Error'}
                  </span>
                </div>
                
                <div style={{ width: '100%', height: '4px', backgroundColor: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${task.progress}%`,
                    height: '100%',
                    backgroundColor: task.status === 'error' ? '#ff4d4f' : task.status === 'success' ? '#52c41a' : '#1890ff',
                    transition: 'width 0.3s ease, background-color 0.3s ease',
                  }} />
                </div>
                {task.message && task.status === 'error' && (
                  <div style={{ color: '#ff4d4f', fontSize: '11px', marginTop: '6px' }}>{task.message}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </TaskContext.Provider>
  );
}
