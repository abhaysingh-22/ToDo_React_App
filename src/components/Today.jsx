import React, { useState, useRef, useContext } from 'react'
import { TodoContext } from '../TodoContext';

import Upcoming from './Upcoming';
import { FiEdit } from "react-icons/fi";
import { MdAdd } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

import { BsThreeDots } from "react-icons/bs";


const Today = () => {

  const { TaskBox, setTaskBox } = useContext(TodoContext)
  const { checkBox, setcheckBox } = useContext(TodoContext)

  const todayTask = TaskBox.filter(task => task.TaskBoxTitle.toLowerCase() === "today")


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

  const handleDeleteTaskBox = (id) => {
    setTaskBox((prevTaskBox) => prevTaskBox.filter((box) => box.id !== id));
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
      <div className='ml-6 mr-6 mb-4 m-auto border-2 mt-5 h-auto  p-4  relative  dark:border-gray-600  rounded-md overflow-auto' id={id} >
        <h1 className='text-2xl font-bold mb-2 flex items-center justify-between' >
          {IsEditing ? (
            <input type='text' value={newTitle} onChange={(e) => setnewTitle(e.target.value)} onBlur={handleSave} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(), handleSave() }} autoFocus className=" outline-1 outline-gray-300 h-[4.5vh] rounded-md px-2 py-1 text-gray-700 dark:bg-gray-700 dark:text-white w-[85%]" />
          ) : (<span onClick={() => setIsEditing(true)} className="cursor-pointer" >{TaskBoxTitle}</span>)}
          <p className="flex gap-2 " > <RxCross2 className="cursor-pointer" onClick={() => onDelete(id)} /><FiEdit className='text-[20px] cursor-pointer ' onClick={() => setIsEditing(true)} /></p>
        </h1>
        <div className="flex border-2 dark:border-gray-600 w-full gap-4 font-semibold text-gray-500 h-10 items-center rounded-md" >
          {IsAddingTask ? (
            <input type='text'
              value={newTaskName}
              onChange={(e) => setnewTaskName(e.target.value)}
              onBlur={handleAddTask} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(), handleAddTask() }} placeholder='Enter new Task' autoFocus className=" text-xl pl-2 outline-none  w-full dark:bg-gray-700 dark:text-white " />
          ) : (
            <div className='flex w-full gap-4 pr-4 pl-1 font-semibold text-gray-500 h-10 items-center rounded-md justify-between ' >
              <button onClick={() => setIsAddingTask(true)} autoFocus className='flex w-full gap-4  outline-none' >
                <p className='flex gap-3 dark:text-white' ><MdAdd className="text-[25px] text-gray-500 dark:text-white" />Add New Task</p>
              </button>
              <BsThreeDots className={`cursor-pointer text-3xl dark:text-white`} />
            </div>
          )}
        </div>
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
    )
  }

  const NewTask = ({ TaskName, taskId, onEdit, onDelete, checked, onToggle }) => {
    const [IsEditing, setIsEditing] = useState(false)
    const [newName, setnewName] = useState(TaskName)

    const handleSaveEdit = () => {
      onEdit(taskId, newName)
      setIsEditing(false);
    }
    // console.log("checked box:", taskId.checked)/


    return (
      <>
        <div className={`flex gap-3 mt-2 items-center h-11 border-2 dark:border-gray-700 rounded-md pl-2 w-full ${checked ? "bg-gray-200 line-through dark:bg-gray-700" : ""} `} >
          {IsEditing ? (<input type='text' value={newName} onChange={(e) => setnewName(e.target.value)} onBlur={handleSaveEdit} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(), handleSaveEdit() } }} autoFocus className="outline-none  dark:bg-gray-700 dark:text-white " />) : (
            <>
              <div className="flex items-center justify-between w-full  " >
                <label for="taskId" className="flex gap-3  overflow-hidden" >
                  <input
                    type="checkbox"
                    id={taskId}
                    checked={checked}
                    onChange={() => onToggle(taskId)}
                    className="cursor-pointer dark:bg-gray-700 dark:text-white"
                  />
                  {TaskName}
                </label>
                <p className="flex gap-2 " > <RxCross2 className="cursor-pointer text-2xl " onClick={() => onDelete(taskId)} /><FiEdit className='text-[20px] cursor-pointer ' onClick={() => setIsEditing(true)} /></p>
              </div>
            </>
          )}

        </div>
      </>
    )
  }


  return (
    <>
      <div className="text-3xl font-bold flex justify-center mt-3 text-gray-500 bg-gray-200 p-1 ml-3 mr-3  rounded-xl m-auto dark:bg-gray-700 dark:text-white " >Today Task</div>

      {todayTask.length === 0 && (
        <div className="flex flex-col items-center justify-center mx-auto my-10 max-w-xl p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center mb-6">
            <svg className="w-20 h-20 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h2 className="text-xl font-bold mb-2 text-gray-700 dark:text-white">No Today Tasks Found</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              To get started with your daily planning, you need to create a list specifically for today's tasks.
            </p>
          </div>

          <div className="flex flex-col w-full space-y-4 mb-4">
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <span>Go to the <span className="font-semibold">Upcoming</span> section</span>
            </div>

            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <span>Click on <span className="font-semibold">New List</span> button</span>
            </div>

            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <span>Name your list exactly <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 font-bold rounded">Today</span></span>
            </div>
          </div>

          <div className="mt-2 flex items-center text-blue-600 dark:text-blue-400 font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Your tasks will automatically appear here</span>
          </div>
        </div>
      )}
      
      {todayTask.map(box => (
        <NewList
          key={box.id}
          id={box.id}
          TaskBoxTitle={box.TaskBoxTitle}
          onDelete={handleDeleteTaskBox}
          onSaveEdit={handleSaveEditTaskBox}
          onAddTask={handleNewCheckBox} />
      ))}

    </>
  )
}

export default Today
