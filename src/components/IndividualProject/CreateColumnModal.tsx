import Modal from '../Global/Modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const CreateColumnModal = ({ isOpen, onClose, onCreateColumn, isLoading }) => {
  const [columnName, setColumnName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnName.trim()) return;
    onCreateColumn(columnName);
    setColumnName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Create New Column</h2>
        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Enter column name"
            value={columnName}
            onChange={e => setColumnName(e.target.value)}
            className="mb-4"
          />
          <Button type="submit" className="w-full" disabled={isLoading || !columnName.trim()}>
            {isLoading ? (
              'Creating...'
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Column
              </>
            )}
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default CreateColumnModal;
