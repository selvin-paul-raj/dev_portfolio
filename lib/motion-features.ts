// Framer Motion feature bundle, loaded lazily by <LazyMotion> in
// context/theme-context.tsx so it stays out of the initial JS chunk.
// domMax (not domAnimation) because Projects/Certifications use `layout` and
// AnimatePresence mode="popLayout".
import { domMax } from "framer-motion";

export default domMax;
