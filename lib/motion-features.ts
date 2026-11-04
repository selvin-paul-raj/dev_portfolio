// Framer Motion feature bundle, loaded lazily by <LazyMotion> in
// context/theme-context.tsx so it stays out of the initial JS chunk.
// domAnimation is enough: nothing renders `layout`, `layoutId`, AnimatePresence or drag.
// Switch to domMax if one of those comes back.
import { domAnimation } from "framer-motion";

export default domAnimation;
