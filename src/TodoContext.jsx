import React, { createContext, useState, useEffect } from 'react';

// Create Context
export const TodoContext = createContext();

// Provider Component
export const TodoProvider = ({ children }) => {
    const [Hide, setHide] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Upcoming tasks - general task lists
    const [TaskBox, setTaskBox] = useState(() => {
        const savedTasks = localStorage.getItem('UpcomingTaskBoxData');
        return savedTasks ? JSON.parse(savedTasks) : [];
    })

    const [checkBox, setcheckBox] = useState(() => {
        const savedChecks = localStorage.getItem('UpcomingCheckBoxData');
        return savedChecks ? JSON.parse(savedChecks) : [];
    });

    // Today tasks - separate storage for today's tasks
    const [TodayTaskBox, setTodayTaskBox] = useState(() => {
        const savedTodayTasks = localStorage.getItem('TodayTaskBoxData');
        return savedTodayTasks ? JSON.parse(savedTodayTasks) : [];
    })

    const [TodayCheckBox, setTodayCheckBox] = useState(() => {
        const savedTodayChecks = localStorage.getItem('TodayCheckBoxData');
        return savedTodayChecks ? JSON.parse(savedTodayChecks) : [];
    });

    const [Lists, setLists] = useState(() => {
        const savedItems = localStorage.getItem('TodoListData');
        return savedItems ? JSON.parse(savedItems) : []; // Initialize with localStorage data or empty array
    });


    // Save Upcoming tasks to localStorage
    useEffect(() => {
        console.log("saved Upcoming TaskBox: ", TaskBox)
        localStorage.setItem('UpcomingTaskBoxData', JSON.stringify(TaskBox))
    }, [TaskBox])

    useEffect(() => {
        console.log("saved Upcoming checkbox: ", checkBox)
        localStorage.setItem('UpcomingCheckBoxData', JSON.stringify(checkBox))
    }, [checkBox])

    // Save Today tasks to localStorage
    useEffect(() => {
        console.log("saved Today TaskBox: ", TodayTaskBox)
        localStorage.setItem('TodayTaskBoxData', JSON.stringify(TodayTaskBox))
    }, [TodayTaskBox])

    useEffect(() => {
        console.log("saved Today checkbox: ", TodayCheckBox)
        localStorage.setItem('TodayCheckBoxData', JSON.stringify(TodayCheckBox))
    }, [TodayCheckBox])

    useEffect(() => {
        console.log('Saving to localStorage:', Lists);
        localStorage.setItem('TodoListData', JSON.stringify(Lists))
    }, [Lists])

    return (
        <TodoContext.Provider value={{ 
            TaskBox, setTaskBox, checkBox, setcheckBox, 
            TodayTaskBox, setTodayTaskBox, TodayCheckBox, setTodayCheckBox,
            Lists, setLists, Hide, setHide, searchQuery, setSearchQuery 
        }}>
            {children}
        </TodoContext.Provider>
    );
};
