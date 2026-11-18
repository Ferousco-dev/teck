import { createRoot } from "react-dom/client";
import Hero from "./Hero"; import Train from "./Train";
createRoot(document.getElementById("r")!).render(<><Hero /><Train /><div style={{height:"60vh"}}/></>);
