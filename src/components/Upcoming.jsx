import React, { useContext } from 'react'
import { TodoContext } from '../TodoContext';
import { useState, useEffect } from 'react';
import { FiEdit } from "react-icons/fi";
import { MdAdd } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import Modal from './Modal';
import { BsThreeDots } from "react-icons/bs";
import { stringify } from 'uuid';

const Upcoming = () => {
    //To load data from Local storage
    const { TaskBox, setTaskBox } = useContext(TodoContext)
    const { checkBox, setcheckBox } = useContext(TodoContext)
    const { Hide, setHide } = useContext(TodoContext)
    const { searchQuery } = useContext(TodoContext)

    const [IsModalOpen, setIsModalOpen] = useState(false)

    // Filter TaskBox and checkBox based on search query
    const filteredTaskBox = TaskBox.filter(box =>
        box.TaskBoxTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    const filteredCheckBox = checkBox.filter(task =>
        task.TaskName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleNewTaskBox = (TaskBoxTitle) => {
        const newBox = { id: Date.now(), TaskBoxTitle, };
        setTaskBox((prevTaskBox) => [...prevTaskBox, newBox])
        console.log("Add new Task box: ", newBox)
    }

    const handleNewCheckBox = (taskBoxId, TaskName) => {
        if (!taskBoxId || !TaskName) {
            console.error("Invalid taskBoxId or TaskName");
            return;
        }

        const newTask = { id: Date.now(), taskBoxId, TaskName, };
        setcheckBox((prevcheckBox) => [...prevcheckBox, newTask]);
    };

    //To delete the taskbox

    const handleDeleteTaskBox = (id, taskBoxId) => {
        setTaskBox((prevTaskBox) => prevTaskBox.filter((box) => box.id !== id));
        setcheckBox((prevcheckBox) => prevcheckBox.filter(task => task && task.taskBoxId !== id))
        console.log("deleted task id: ", id)
    }

    const handleDeleteCheckBox = (taskId) => {
        setcheckBox((prevcheckBox) => prevcheckBox.filter(task => task && task.id !== taskId))
    }

    // Handle the edit button

    const handleSaveEditTaskBox = (id, newTitle) => {
        setTaskBox((prevTaskBox) => prevTaskBox.map((box) => box.id === id ? { ...box, TaskBoxTitle: newTitle } : box))
        console.log("Edited task box with id: ", id, "New title: ", newTitle)
    }

    const handleEditCheckBox = (taskId, newTaskName) => {
        setcheckBox((prevcheckBox) => prevcheckBox.map((task) => task && task.id === taskId ? { ...task, TaskName: newTaskName } : task))
    }

    const handleCheckedTask = (taskId) => {
        setcheckBox((prevcheckbox) => {
            const updatedTask = prevcheckbox.map((task) => task.id === taskId ? { ...task, checked: !task.checked } : task)
            console.log("Updated checkBox state:", updatedTask);
            localStorage.setItem('checkBoxData', JSON.stringify(updatedTask))
            return updatedTask;
        });
    }

    const NewList = ({ TaskBoxTitle, id, onDelete, onEdit, onSaveEdit, onAddTask, tasks, setcheckBox }) => {
        const [IsEditing, setIsEditing] = useState(false)
        const [newTitle, setnewTitle] = useState(TaskBoxTitle)
        const [IsAddingTask, setIsAddingTask] = useState(false);
        const [newTaskName, setnewTaskName] = useState("");

        const taskForThisBox = checkBox.filter(
            (task) => task && task.taskBoxId === id
        );

        const handleSave = () => {
            onSaveEdit(id, newTitle)
            setIsEditing(false);
        }

        const handleAddTask = () => {
            if (newTaskName.trim() !== "") {
                onAddTask(id, newTaskName)
                setnewTaskName("")
            }
            setIsAddingTask(false);
        }

        return (
            <div className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-md p-3 sm:p-4 self-start overflow-hidden flex flex-col h-auto dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200" id={id}>
                <h1 className="text-xl sm:text-2xl font-bold mb-3 flex items-center justify-between gap-2 dark:text-white">
                    {IsEditing ? (
                        <input 
                            type="text" 
                            value={newTitle} 
                            onChange={(e) => setnewTitle(e.target.value)} 
                            onBlur={handleSave} 
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); }}} 
                            autoFocus 
                            className="outline-none border-2 border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full text-gray-700 dark:text-white dark:bg-gray-700 focus:border-purple-400 dark:focus:border-purple-500" 
                        />
                    ) : (
                        <span 
                            onClick={() => setIsEditing(true)} 
                            className="cursor-pointer break-words overflow-hidden overflow-ellipsis w-full"
                        >
                            {TaskBoxTitle}
                        </span>
                    )}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button 
                            onClick={() => onDelete(id)} 
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Delete list"
                        >
                            <RxCross2 className="text-xl text-gray-600 dark:text-white" />
                        </button>
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Edit list"
                        >
                            <FiEdit className="text-lg text-gray-600 dark:text-white" />
                        </button>
                    </div>
                </h1>
                <div className="flex border-2 border-gray-300 dark:border-gray-600 w-full font-semibold text-gray-500 dark:text-gray-300 h-12 items-center rounded-md mb-2">
                    {IsAddingTask ? (
                        <input 
                            type="text"
                            value={newTaskName}
                            onChange={(e) => setnewTaskName(e.target.value)}
                            onBlur={handleAddTask} 
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTask(); }}}
                            placeholder="Enter new task"
                            autoFocus
                            className="h-full text-base sm:text-lg px-3 outline-none w-full rounded-md dark:bg-gray-700 dark:text-white"
                        />
                    ) : (
                        <button 
                            onClick={() => setIsAddingTask(true)} 
                            className="flex w-full items-center justify-between px-3 py-2 h-full rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <MdAdd className="text-2xl text-gray-500 dark:text-gray-300" />
                                <span className="text-gray-500 dark:text-gray-300">Add New Task</span>
                            </div>
                            <BsThreeDots className="text-2xl cursor-pointer text-gray-500 dark:text-gray-300" />
                        </button>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto max-h-[60vh] space-y-2">
                    {taskForThisBox.map((task) => (
                        <NewTask
                            key={task.id}
                            taskId={task.id}
                            checked={task.checked}
                            onToggle={handleCheckedTask}
                            TaskName={task.TaskName}
                            onEdit={(taskId, newName) => handleEditCheckBox(taskId, newName)}
                            onDelete={handleDeleteCheckBox}
                        />
                    ))}
                </div>
            </div>
        )
    }

    const NewTask = ({ TaskName, taskId, onEdit, onDelete, checked, onToggle }) => {
        const [IsEditing, setIsEditing] = useState(false)
        const [newName, setnewName] = useState(TaskName)

        const handleSaveEdit = () => {
            onEdit(taskId, newName)
            setIsEditing(false);
        }

        return (
            <div className={`flex items-center gap-2 p-2 border-2 dark:border-gray-700 rounded-md w-full ${checked ? "bg-gray-200 dark:bg-gray-700" : ""}`}>
                {IsEditing ? (
                    <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setnewName(e.target.value)} 
                        onBlur={handleSaveEdit} 
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSaveEdit(); }}} 
                        autoFocus 
                        className="outline-none w-full px-2 py-1 dark:bg-gray-700 dark:text-white" 
                    />
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <label 
                            htmlFor={`task-${taskId}`} 
                            className={`flex items-center gap-3 w-full cursor-pointer dark:text-white ${checked ? "line-through text-gray-500 dark:text-gray-400" : ""}`}
                        >
                            <input
                                type="checkbox"
                                id={`task-${taskId}`}
                                checked={checked}
                                onChange={() => onToggle(taskId)}
                                className="h-4 w-4 cursor-pointer accent-purple-500 dark:bg-gray-700"
                            />
                            <span className="break-words overflow-hidden overflow-ellipsis">{TaskName}</span>
                        </label>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button 
                                onClick={() => onDelete(taskId)} 
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                aria-label="Delete task"
                            >
                                <RxCross2 className="text-xl text-gray-600 dark:text-white" />
                            </button>
                            <button 
                                onClick={() => setIsEditing(true)} 
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                aria-label="Edit task"
                            >
                                <FiEdit className="text-lg text-gray-600 dark:text-white" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <div className="h-full min-h-[90vh] w-full px-2 sm:px-4 md:px-6 overflow-y-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-4 sm:my-6">
                    <div className="flex items-center gap-3 sm:gap-5">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold dark:text-white">Upcoming</h1>
                        <span className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 flex items-center justify-center text-xl sm:text-2xl md:text-4xl font-semibold border-2 rounded-md dark:border-gray-600 dark:text-white">{checkBox.length}</span>
                    </div>
                    <button 
                        className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-purple-500 dark:bg-gradient-to-r from-blue-700 to-purple-700 rounded-lg text-base sm:text-lg font-semibold text-white dark:text-white cursor-pointer hover:bg-purple-600 dark:hover:bg-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                        onClick={() => setIsModalOpen(true)}
                    >
                        New List
                    </button>
                </div>
                <hr className="border-1 border-gray-300 dark:border-gray-600 mb-4 sm:mb-6"></hr>
                
                {searchQuery && filteredTaskBox.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10">
                        <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">No tasks found matching "{searchQuery}"</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try a different search term</p>
                    </div>
                )}
                
                {!searchQuery && TaskBox.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[70vh] w-full text-center px-4 py-6">
                        <div className="mb-4 flex flex-col items-center">
                            <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                            </svg>
                            <h1 className="text-xl sm:text-2xl font-bold mb-2 dark:text-white">Welcome to DayStacks</h1>
                            <h2 className="text-base sm:text-lg font-bold dark:text-white">No Lists Yet</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm sm:max-w-md">
                            Create your first list to start organizing your tasks. Click the "New List" button to get started.
                        </p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors duration-300 dark:bg-gradient-to-r from-blue-700 to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Create New List
                        </button>
                    </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 h-auto pb-8">
                    {filteredTaskBox.map((box) => (
                        <NewList
                            key={box.id}
                            id={box.id}
                            TaskBoxTitle={box.TaskBoxTitle}
                            onDelete={handleDeleteTaskBox}
                            onSaveEdit={handleSaveEditTaskBox}
                            onAddTask={handleNewCheckBox} 
                        />
                    ))}
                </div>
                <Modal
                    isOpen={IsModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleNewTaskBox}
                />
            </div>
        </>
    )
}

export default Upcoming
