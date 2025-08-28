import React, { createContext, useState, useEffect } from 'react';

// Create Context
export const TodoContext = createContext();

// Provider Component
export const TodoProvider = ({ children }) => {
    // const [TaskBox, setTaskBox] = useState([]);
    // const [checkBox, setcheckBox] = useState([]);
        const [Hide, setHide] = useState(false)

    const [TaskBox, setTaskBox] = useState(() => {
        const savedTasks = localStorage.getItem('TaskBoxData');
        return savedTasks ? JSON.parse(savedTasks) : [];
    })


    const [checkBox, setcheckBox] = useState(() => {
        const savedChecks = localStorage.getItem('checkBoxData');
        return savedChecks ? JSON.parse(savedChecks) : [];
    });

    const [Lists, setLists] = useState(() => {
        const savedItems = localStorage.getItem('TodoListData');
        return savedItems ? JSON.parse(savedItems) : []; // Initialize with localStorage data or empty array
    });


    useEffect(() => {
        console.log("saved TaskBox: ", TaskBox)
        localStorage.setItem('TaskBoxData', JSON.stringify(TaskBox))

    }, [TaskBox])


    useEffect(() => {
        console.log("saved checkbox: ", checkBox)
        localStorage.setItem('checkBoxData', JSON.stringify(checkBox))
    }, [checkBox])

    useEffect(() => {
        console.log('Saving to localStorage:', Lists);
        localStorage.setItem('TodoListData', JSON.stringify(Lists))
    }, [Lists])

    return (
        <TodoContext.Provider value={{ TaskBox, setTaskBox, checkBox, setcheckBox, Lists, setLists, Hide, setHide }}>
            {children}
        </TodoContext.Provider>
    );
};
