import type {AppProps} from "next/app";

import "../style.css";
import "../App.css";
import {create} from 'zustand'
import {Sprint, Task} from "../types";


// This default export is required in a new `pages/_app.js` file.
export default function MyApp({Component, pageProps}: AppProps) {
    return <Component {...pageProps} />;
}
