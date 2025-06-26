import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { TodoContext } from "../TodoContext";


const WebViewer = () => {
    const { site } = useParams();

    const { Lists, setLists } = useContext(TodoContext)

    const website = Lists.find((item) => item.name.toLowerCase() === site.toLowerCase());

    if (!website) {
        // If no matching site is found
        return <p className="p-4">Website not found</p>;
    }

    return (
        <div className="h-[100vh]">
            <iframe
                src={website.SiteUrl}
                className="w-full h-full border-none"
                title={website.name}
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />

        </div>
    );


}
export default WebViewer;
