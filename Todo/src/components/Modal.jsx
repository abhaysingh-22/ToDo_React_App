import React, { useState, useEffect } from "react";

const Modal = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState("");

    const handleSave = () => {
        if (title.trim()) {
            onSave(title);
            setTitle("");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50  ${isOpen ? "opacity-100 visible transition-opacity duration-200": "opacity-0 invisible"}  `}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-[90%] sm:w-[400px]">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Add New Task Box</h2>
                <input
                    type="text"
                    placeholder="Enter title"
                    value={title}
                    onBlur={()=> handleSave()}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border-2 border-blue-400 dark:border-blue-600 rounded-md p-2 mb-4 focus:outline-none shadow-2xl dark:bg-gray-700 dark:text-white"
                    autoFocus
                    onKeyDown={(e)=> {if(e.key === "Enter") e.preventDefault(), handleSave()}}
                />
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-purple-400 dark:bg-gradient-to-r from-blue-700  to-purple-700 text-white rounded-lg hover:bg-purple-900  dark:hover:bg-purple-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal
