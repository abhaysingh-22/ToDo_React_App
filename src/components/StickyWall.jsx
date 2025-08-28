import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const StickyWall = () => {
    const [notes, setNotes] = useState(() => {
        const savedNotes = JSON.parse(localStorage.getItem('stickyNotes'));
        return savedNotes || [];

    });

    // Load saved notes from localStorage when the component mounts
    // useEffect(() => {
    //     const savedNotes = JSON.parse(localStorage.getItem('stickyNotes'));
    //     if (savedNotes) {
    //         setNotes(savedNotes);
    //     }
    // }, []);

    // Save notes to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('stickyNotes', JSON.stringify(notes));
    }, [notes]);

    // Add a new note
    const addNote = () => {
        const newNote = {
            id: Date.now(),
            content: '',
            bgColor: '#333', // Default background color
            textColor: '#fff', // Default text color
        };
        setNotes([...notes, newNote]);
    };

    // Update a note's content
    const updateNoteContent = (id, newContent) => {
        setNotes(notes.map(note => (note.id === id ? { ...note, content: newContent } : note)));
    };

    // Update a note's background color
    const updateNoteBgColor = (id, newBgColor) => {
        setNotes(notes.map(note => (note.id === id ? { ...note, bgColor: newBgColor } : note)));
    };

    // Update a note's text color
    const updateNoteTextColor = (id, newTextColor) => {
        setNotes(notes.map(note => (note.id === id ? { ...note, textColor: newTextColor } : note)));
    };

    // Delete a note
    const deleteNote = (id) => {
        setNotes(notes.filter(note => note.id !== id));
    };

    return (
        <div style={{ padding: '20px' }}>
            <button
                onClick={addNote}
                style={{
                    backgroundColor: '#FFD700',
                    color: '#000',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginBottom: '20px',
                }}
            >
                + Add Note
            </button>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', overflow:"auto", height: "87vh" }}>
                {notes.map(note => (
                    <div
                        key={note.id}
                        style={{
                            width: '350px',
                            height: '300px',
                            
                            backgroundColor: note.bgColor,
                            color: note.textColor,
                            borderRadius: '10px',
                            padding: '10px',
                            position: 'relative',
                        }}
                    >
                        <button
                            onClick={() => deleteNote(note.id)}
                            style={{
                                position: 'absolute',
                                bottom: '5px',
                                right: '5px',
                                backgroundColor: 'red',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '25px',
                                height: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                            }}
                        >
                            ✖
                        </button>

                        {/* Background Color Picker */}
                        <input
                            type="color"
                            value={note.bgColor}
                            onChange={(e) => updateNoteBgColor(note.id, e.target.value)}
                            style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '10px',
                                cursor: 'pointer',
                                border: 'none',
                                outline: 'none',
                            }}
                        />

                        {/* Text Color Picker */}
                        {/* <input
                            type="color"
                            value={note.textColor}
                            onChange={(e) => updateNoteTextColor(note.id, e.target.value)}
                            style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                cursor: 'pointer',
                                border: 'none',
                                outline: 'none',
                            }}
                        /> */}

                        {/* TinyMCE Editor */}
                        <Editor
                            apiKey="05airh921ipozhbvc6etocfisv12a05wxxa3t2zyfy15knnj" // Replace with your API key
                            value={note.content}
                            init={{
                                height: 250,
                                menubar: false,
                                plugins: 'lists link image code',
                                toolbar:
                                    'undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent',
                                content_style: `body { color: ${note.textColor}; background-color: ${note.bgColor}; }`, // Apply the colors to the editor's content
                            }}
                            onEditorChange={(newContent) => updateNoteContent(note.id, newContent)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StickyWall;
