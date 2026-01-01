import React, { useState, useRef, useContext } from 'react'
import { TodoContext } from '../TodoContext';
import Modal from './Modal';
import { FiEdit } from "react-icons/fi";
import { MdAdd } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { BsThreeDots } from "react-icons/bs";


const Today = () => {

  const { TodayTaskBox, setTodayTaskBox, TodayCheckBox, setTodayCheckBox } = useContext(TodoContext)
  const { searchQuery } = useContext(TodoContext)
  
  const [IsModalOpen, setIsModalOpen] = useState(false)
  
  // Filter today tasks based on search query from context
  const filteredTodayTask = TodayTaskBox.filter(box => {
    // Show box if title matches
    if (box.TaskBoxTitle.toLowerCase().includes(searchQuery.toLowerCase())) {
      return true;
    }
    // Show box if any of its tasks match
    const boxTasks = TodayCheckBox.filter(task => task && task.taskBoxId === box.id);
    return boxTasks.some(task => 
      task.TaskName && task.TaskName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  })


  const handleNewTaskBox = (TaskBoxTitle) => {
    const newBox = { id: Date.now(), TaskBoxTitle, };
    setTodayTaskBox((prevTaskBox) => [...prevTaskBox, newBox])
    console.log("Add new Today Task box: ", newBox)
  }


  const handleNewCheckBox = (taskBoxId, TaskName) => {
    if (!taskBoxId || !TaskName) {
      console.error("Invalid taskBoxId or TaskName");
      return;
    }

    const newTask = { id: Date.now(), taskBoxId, TaskName, };
    setTodayCheckBox((prevcheckBox) => [...prevcheckBox, newTask]);
  };


  //To delete the taskbox

  const handleDeleteTaskBox = (id) => {
    setTodayTaskBox((prevTaskBox) => prevTaskBox.filter((box) => box.id !== id));
    setTodayCheckBox((prevcheckBox) => prevcheckBox.filter(task => task && task.taskBoxId !== id))
    console.log("deleted today task id: ", id)
  }

  const handleDeleteCheckBox = (taskId) => {
    setTodayCheckBox((prevcheckBox) => prevcheckBox.filter(task => task && task.id !== taskId))
  }

  // Handle the edit button


  const handleSaveEditTaskBox = (id, newTitle) => {
    setTodayTaskBox((prevTaskBox) => prevTaskBox.map((box) => box.id === id ? { ...box, TaskBoxTitle: newTitle } : box))
    console.log("Edited today task box with id: ", id, "New title: ", newTitle)
  }


  const handleEditCheckBox = (taskId, newTaskName) => {
    setTodayCheckBox((prevcheckBox) => prevcheckBox.map((task) => task && task.id === taskId ? { ...task, TaskName: newTaskName } : task))
  }

  const handleCheckedTask = (taskId) => {
    setTodayCheckBox((prevcheckbox) => {
      const updatedTask = prevcheckbox.map((task) => task.id === taskId ? { ...task, checked: !task.checked } : task)
      console.log("Updated Today checkBox state:", updatedTask);
      localStorage.setItem('TodayCheckBoxData', JSON.stringify(updatedTask))
      return updatedTask;
    });
  }







  const NewList = ({ TaskBoxTitle, id, onDelete, onEdit, onSaveEdit, onAddTask, tasks, setcheckBox, searchQuery, TodayCheckBox }) => {
    const [IsEditing, setIsEditing] = useState(false)
    const [newTitle, setnewTitle] = useState(TaskBoxTitle)
    const [IsAddingTask, setIsAddingTask] = useState(false);
    const [newTaskName, setnewTaskName] = useState("");

    const taskForThisBox = TodayCheckBox.filter(
      (task) => task && task.taskBoxId === id && 
      (!searchQuery || task.TaskName?.toLowerCase().includes(searchQuery.toLowerCase()))
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
              <button onClick={() => setIsAddingTask(true)} className='flex w-full gap-4  outline-none' >
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
      <div className="h-full min-h-[90vh] w-full px-2 sm:px-4 md:px-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-4 sm:my-6">
          <div className="flex items-center gap-3 sm:gap-5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold dark:text-white">Today</h1>
            <span className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 flex items-center justify-center text-xl sm:text-2xl md:text-4xl font-semibold border-2 rounded-md dark:border-gray-600 dark:text-white">{TodayCheckBox.filter(task => !task.checked).length}</span>
          </div>
          <button 
            className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-purple-500 dark:bg-gradient-to-r from-blue-700 to-purple-700 rounded-lg text-base sm:text-lg font-semibold text-white dark:text-white cursor-pointer hover:bg-purple-600 dark:hover:bg-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            onClick={() => setIsModalOpen(true)}
          >
            New List
          </button>
        </div>
        <hr className="border-1 border-gray-300 dark:border-gray-600 mb-4 sm:mb-6"></hr>

        <hr className="border-1 border-gray-300 dark:border-gray-600 mb-4 sm:mb-6"></hr>

        {searchQuery && filteredTodayTask.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">No tasks found matching "{searchQuery}"</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try a different search term</p>
          </div>
        )}

        {!searchQuery && TodayTaskBox.length === 0 && (
        <div className="flex flex-col items-center justify-center mx-auto my-10 max-w-xl p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center mb-6">
            <svg className="w-20 h-20 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h2 className="text-xl font-bold mb-2 text-gray-700 dark:text-white">No Today Tasks Yet</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              This section is for your daily tasks. Tasks created here are separate from your Upcoming tasks.
            </p>
          </div>

          <div className="flex flex-col w-full space-y-4 mb-4">
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <span>Create task lists directly on this page using the <span className="font-semibold">+ Add</span> button</span>
            </div>

            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span>Add individual tasks to each list</span>
            </div>
          </div>

          <div className="mt-2 flex items-center text-blue-600 dark:text-blue-400 font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Today tasks are separate from Upcoming tasks</span>
          </div>
        </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 h-auto pb-8 items-start">
          {(searchQuery ? filteredTodayTask : TodayTaskBox).map(box => (
            <NewList
              key={box.id}
              id={box.id}
              TaskBoxTitle={box.TaskBoxTitle}
              onDelete={handleDeleteTaskBox}
              onSaveEdit={handleSaveEditTaskBox}
              onAddTask={handleNewCheckBox}
              searchQuery={searchQuery}
              TodayCheckBox={TodayCheckBox}
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

export default Today
