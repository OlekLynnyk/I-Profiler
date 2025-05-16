'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthProvider';
import { useDemoAttempts } from '@/app/hooks/useDemoAttempts';
import DemoAccessBlocker from './DemoAccessBlocker';

interface NewProjectModalProps {
  onClose: () => void;
}

export default function NewProjectModal({ onClose }: NewProjectModalProps) {
  const { supabase, session } = useAuth();
  const { demoAttempts, limitReached, packageType } = useDemoAttempts();

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name.');
      return;
    }

    if (!session?.user) {
      alert('No active session. Please login first.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('projects').insert([
      {
        user_id: session.user.id,
        name: projectName,
        description: description,
        created_at: new Date().toISOString(),
      },
    ]);

    if (packageType === 'Freemium') {
      await supabase
        .from('demo_attempts')
        .update({ count: demoAttempts + 1 })
        .eq('user_id', session.user.id);
    }

    setLoading(false);

    if (error) {
      console.error('Insert Error:', error.message || error);
      alert('Failed to create project: ' + (error.message || 'Unknown error.'));
    } else {
      alert('Project created successfully!');
      onClose();
    }
  };

  return (
    <DemoAccessBlocker>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-8 rounded-xl w-96 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">Start New Project</h2>

          <input
            type="text"
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-700"
          />

          <textarea
            placeholder="Short Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-700"
            rows={4}
          />

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </DemoAccessBlocker>
  );
}
