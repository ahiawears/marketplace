"use client";

 import { useEffect } from "react";

 export function ClientEffects() {
   useEffect(() => {
     const handleWheel = (event: WheelEvent) => {
       if (event.target instanceof HTMLInputElement) {
         if (
           event.target.type === "number" &&
           document.activeElement === event.target
         ) {
           event.preventDefault();
         }
       }
     };

     document.addEventListener("wheel", handleWheel, { passive: false });

     return () => {
       document.removeEventListener("wheel", handleWheel);
     };
   }, []); 
   return null;
 }