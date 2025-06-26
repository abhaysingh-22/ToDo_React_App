import React, { useState } from 'react';

const AddNewListModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [siteUrl, setSiteUrl] = useState('');

    const handleSave = () => {
        if (name.trim() && siteUrl.trim()) {
            onSave(name, siteUrl);
            setName('');
            setSiteUrl('');
            onClose();
        } else {
            alert('Both fields are required.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Add New Video</h3>
                <input
                    type="text"
                    placeholder="Enter the title of New YT Video"
                    className="border-2 p-2 w-full rounded-md mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter URL of YT Video "
                    className="border-2 p-2 w-full rounded-md mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                />
                <div className="flex justify-end space-x-4">
                    <button
                        className="px-4 py-2 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded-md"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-purple-400 dark:bg-gradient-to-r from-blue-700  to-purple-700 text-white rounded-md"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddNewListModal;