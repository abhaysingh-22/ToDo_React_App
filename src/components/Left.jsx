import React, { useContext, useMemo, useRef, useLayoutEffect } from "react";
import { TodoContext } from "../TodoContext";
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { RxHamburgerMenu } from "react-icons/rx";
import { FaListCheck } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { MdAdd } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import AddNewListModal from "./AddNewListModal";
import DarkModeToggle from "./DarkModeToggle";

const uniqueID = uuidv4();

const Left = () => {

    const { TodayCheckBox } = useContext(TodoContext)
    const { Lists, setLists } = useContext(TodoContext)
    const { Hide, setHide } = useContext(TodoContext)
    const { searchQuery: contextSearchQuery, setSearchQuery } = useContext(TodoContext)

    const [selectedDiv, setselectedDiv] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState("");

    // --- Focus-stable search input ---
    const searchInputRef = useRef(null);
    const searchHadFocusRef = useRef(false);

    // If something in the app steals focus on each render, this puts it back.
    useLayoutEffect(() => {
        if (!searchHadFocusRef.current) return;
        const el = searchInputRef.current;
        if (!el) return;

        // Only refocus if we lost it
        if (document.activeElement !== el) {
            el.focus({ preventScroll: true });

            // Keep caret at end (common expected behavior for search)
            const len = el.value?.length ?? 0;
            try {
                el.setSelectionRange(len, len);
            } catch {
                // ignore (some inputs/browsers can throw)
            }
        }
    }, [localSearchQuery]);

    const handleSearchInput = (e) => {
        setLocalSearchQuery(e.target.value);
    };

    // Sync sidebar search to global context (used by Today filtering)
    useEffect(() => {
        const id = setTimeout(() => {
            setSearchQuery(localSearchQuery);
        }, 0);
        return () => clearTimeout(id);
    }, [localSearchQuery, setSearchQuery]);

    const FilteredVideo = useMemo(() => {
        if (!localSearchQuery.trim()) return Lists;
        return Lists.filter(list =>
            list.name.toLowerCase().includes(localSearchQuery.toLowerCase())
        )
    }, [Lists, localSearchQuery]);


    // Helper function to generate a random color
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    // set dynamic height for dynamic content
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const updateHeight = () => {
            const screenHeight = window.innerHeight;
            const first = document.getElementById("firstDiv")?.offsetHeight || 0;
            const second = document.getElementById("secondDiv")?.offsetHeight || 0;
            const third = document.getElementById("secondDiv")?.offsetHeight || 0;
            setHeight(screenHeight - (first + second + third));
        };

        updateHeight();
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);


    const handleAddNewList = (name, SiteUrl) => {
        try {
            const url = new URL(SiteUrl);
            let embedUrl = SiteUrl;

            if (
                url.hostname === "www.youtube.com" ||
                url.hostname === "youtube.com"
            ) {
                const videoId = url.searchParams.get("v");
                const playlistId = url.searchParams.get("list");

                if (playlistId) {
                    embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
                } else if (videoId) {
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                }
            } else if (url.hostname === "youtu.be") {
                const path = url.pathname.slice(1);
                const playlistId = url.searchParams.get("list");

                if (playlistId) {
                    embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
                } else {
                    embedUrl = `https://www.youtube.com/embed/${path}`;
                }
            }

            const newList = { id: Date.now(), name, SiteUrl: embedUrl };
            setLists((prevLists) => [...prevLists, newList]);
            console.log("Added new list:", newList);
        } catch (error) {
            console.error("Invalid URL format:", error);
            alert("Please enter a valid URL.");
        }
    };


    const handleDeleteSite = (id) => {
        setLists((previousSite) => previousSite.filter(list => list.id != id))
    }



    const TaskItems = ({ to, Icon, Title, id, NOFTask, selectedDiv, setselectedDiv }) => {
        return (
            <li className={`flex items-center justify-between cursor-pointer box-border p-[5px] rounded-md dark:bg-gray-700 dark:hover:bg-gray-900 ${selectedDiv === id ? 'bg-gray-200' : 'bg-gray-100'} hover:bg-gray-200 transition-all duration-300`} onClick={() => setselectedDiv(id)}>
                <Link to={to} className="flex items-center justify-between w-full text-inherit">
                    <p className="flex items-center gap-3 text-gray-500 dark:text-white text-lg font-semibold ">{Icon}{Title} </p>
                    <span className={`h-5 w-7 rounded-[4px] bg-gray-200 text-[12px] flex items-center justify-center font-semibold dark:bg-gray-900 dark:text-white ${selectedDiv === id ? 'bg-white' : 'bg-gray-200'} `} >{NOFTask}</span>
                </Link>
            </li>
        )
    }
    const ListItems = ({ id, NOFTask, name, onAddNew, to }) => {
        const randomColor = useMemo(() => getRandomColor(), [id]);
        return (
            <li className={` dark:bg-gray-700 dark:hover:bg-gray-900 rounded-md w-full ${selectedDiv === id ? 'bg-gray-200' : 'bg-gray-100'} hover:bg-gray-200 transition-all duration-300`} onClick={() => setselectedDiv(id)} >
                <Link to={to} className="flex w-full items-center gap-1 p-[5px] border-2 dark:border-gray-600 rounded-md cursor-pointer" >
                    <div className="flex items-center gap-2 w-full ">
                        <span className="h-4 w-4 rounded-[4px]" style={{ backgroundColor: randomColor }}></span>
                        <span className="text-md font-semibold text-gray-500 dark:text-white w-[10vw] overflow-clip " >{name}</span>
                    </div>
                    <button className={` flex items-center justify-center`} >
                        <RxCross2 className="cursor-pointer text-xl text-gray-600 dark:text-white " onClick={() => handleDeleteSite(id)} />
                    </button>
                </Link>
            </li>
        )
    }

    const VideoList = ({ id, NOFTask, name, onAddNew, to }) => {
        const randomColor = useMemo(() => getRandomColor(), [id]);
        return (
            <Link to={to} className="flex items-center justify-center p-1 border-[1px] dark:border-gray-600 rounded-md cursor-pointer" >
                <span className="h-6 w-6 rounded-[4px] text-white flex items-center justify-center " style={{ backgroundColor: randomColor }}>{name?.charAt(0).toUpperCase()}</span>
            </Link>
        )
    }


    const TaskItems1 = ({ to, Icon, Title, id, NOFTask, selectedDiv, setselectedDiv }) => {
        return (
            <li className={`flex items-center justify-between cursor-pointer box-border p-[5px] rounded-md dark:bg-gray-700 dark:hover:bg-gray-900 ${selectedDiv === id ? 'bg-gray-200' : 'bg-gray-100'} hover:bg-gray-200 transition-all duration-300`} onClick={() => setselectedDiv(id)}>
                <Link to={to} className="flex items-center justify-between w-full text-inherit">
                    <p className="flex items-center gap-3 text-gray-500 dark:text-white text-lg font-semibold ">{Icon}{Title} </p>
                </Link>
            </li>
        )
    }
    const AddNewListButton = ({ Icon, Title, id, NOFTask, onClick }) => {
        const handleClick = () => {
            setselectedDiv(id);
            if (onClick) {
                onClick();
            }
        }
        return (
            <button className={`flex items-center cursor-pointer box-border p-[5px] rounded-md gap-3 text-gray-500 text-md font-semibold w-full m-2 dark:bg-gray-700 dark:text-white ${selectedDiv === id ? 'bg-gray-200' : 'bg-gray-100'} hover:bg-gray-200 dark:hover:bg-gray-900 transition-all duration-300 `} onClick={handleClick}>{Icon}{Title}</button>
        )
    }

    const SideBar = () => {
        const containerRef = useRef(null);
        const [contentHeight, setContentHeight] = useState('calc(100% - 200px)');

        useEffect(() => {
            const updateHeight = () => {
                if (containerRef.current) {
                    const parentHeight = containerRef.current.offsetHeight;
                    const iconsSection = containerRef.current.querySelector('div:first-child')?.offsetHeight || 0;
                    const availableHeight = parentHeight - iconsSection - 20;
                    setContentHeight(`${availableHeight}px`);
                }
            };

            updateHeight();
            window.addEventListener('resize', updateHeight);
            return () => window.removeEventListener('resize', updateHeight);
        }, []);

        return (
            <>
                <div ref={containerRef} className={`flex flex-col items-center h-full mt-3 max-lg:inline-block gap-3 pl-1 text-gray-600 dark:text-gray-300 ${Hide ? "inline-block" : "hidden"} `} >
                    <div className="flex flex-col items-center gap-2">
                        <RxHamburgerMenu onClick={() => setHide(!Hide)} className="text-3xl cursor-pointer mb-3 hover:text-gray-500 " />
                        <DarkModeToggle />
                        <Link to="/" ><FaListCheck className="text-3xl mb-3 hover:text-gray-500 " /></Link>
                        <Link to="/Calendar" ><FaCalendarAlt className="text-3xl mb-3 hover:text-gray-500" /></Link>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-white rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-900 transition-all duration-300">
                            <MdAdd className="text-2xl" />
                        </button>
                    </div>
                    <div className="mt-3 flex flex-1 flex-col gap-2 overflow-y-auto pb-4 touch-auto" style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        height: contentHeight
                    }}>
                        {FilteredVideo.map((site) => (
                            <VideoList to={`/web/${site.name}`} key={site.id} name={site.name} id={site.id} />
                        ))}
                    </div>
                </div>
            </>
        );
    };



    return (
        <>
            <div className="h-full" >
                <SideBar />
                <div className={`left h-full p-2 pb-0 max-lg:hidden top-0 ${Hide ? "transform opacity-0 -translate-x-full w-0 overflow-hidden duration-200 ease-in-out" : "transform opacity-100 ease-in-out w-[20dvw] translate-x-0 duration-200"} `}>
                    <div className=" bg-[#f4f4f4] dark:bg-gray-800  h-full p-3 flex flex-col  justify-between rounded-[15px] w-full ">
                        <div className="flex flex-col gap-5 h-full w-full ">
                            <div id="firstDiv" className="flex items-center justify-between mt-[10px] ml-1 mr-1">
                                <h1 className="text-2xl font-bold text-gray-600 dark:text-gray-200" >Menu</h1>
                                <div className="flex items-center gap-2">
                                    <DarkModeToggle />
                                    <span className="text-[25px] text-gray-500 dark:text-gray-300 cursor-pointer" >
                                        <RxHamburgerMenu onClick={() => setHide(!Hide)} />
                                    </span>
                                </div>
                            </div>
                            <div id="secondDiv" className="flex relative " >
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search"
                                    className="dark:bg-gray-700 dark:text-white bg-gray-100 w-[100%] pl-10 h-[40px] outline-none rounded-md border-[2px] border-gray-200 dark:border-gray-600 text-lg font-semibold"
                                    value={localSearchQuery}
                                    onChange={handleSearchInput}
                                    onFocus={() => { searchHadFocusRef.current = true; }}
                                    onBlur={() => { searchHadFocusRef.current = false; }}
                                    onKeyDown={(e) => { e.stopPropagation(); }}
                                    onKeyUp={(e) => { e.stopPropagation(); }}
                                    onClick={(e) => { e.stopPropagation(); }}
                                />
                                <IoSearch className="absolute left-2 top-1/4 text-gray-500 text-[20px]" />
                            </div>
                            <div id="thirdDiv" className=" mt-4 flex flex-col items-center" >
                                <h2 className="font-bold text-gray-600 dark:text-white " >TASKS</h2>
                                <ul className="ml-2 mt-3 w-full flex flex-col gap-3 dark:text-white " >
                                    <TaskItems to="/" id={1} NOFTask={TodayCheckBox.length} Icon={<FaListCheck />} Title="Today" selectedDiv={selectedDiv} setselectedDiv={setselectedDiv} />
                                    <TaskItems1 to="/Calendar" id={2} NOFTask={null} Icon={<FaCalendarAlt />} Title="Calendar" selectedDiv={selectedDiv} setselectedDiv={setselectedDiv} />
                                </ul>
                            </div>
                            <hr className=" border-t-[2px] border-gray-200 dark:border-gray-500" />
                            <div style={{ height, overflowX: "hidden" }} className="w-full flex flex-col  items-center" >
                                <h3 className="font-bold text-gray-600 text-lg dark:text-white" >Videos/Website</h3>
                                <AddNewListButton onClick={() => setIsModalOpen(true)}
                                    id={6} Title={"Add New Video/Website"} Icon={<MdAdd className="text-[25px] text-gray-500 dark:text-white" />} />
                                <div className="w-full overflow-y-auto" >
                                    <ul className="mt-3 flex flex-col gap-3 w-full overflow-y-auto " >
                                        {Lists.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-5 px-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                                </svg>
                                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">No Videos Available</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">Add your favorite tutorial videos for quick access</p>
                                                <div className="flex flex-col text-xs text-gray-600 dark:text-gray-300 space-y-2 mt-1">
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                        </svg>
                                                        <span>Click "Add New Video" button</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                        </svg>
                                                        <span>Enter a descriptive title</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                                                        </svg>
                                                        <span>Paste YouTube URL</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {FilteredVideo.map((site) => (
                                            <ListItems to={`/web/${site.name}`} key={site.id} name={site.name} id={site.id} />
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AddNewListModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddNewList}
            />
        </>
    )

}
export default Left;