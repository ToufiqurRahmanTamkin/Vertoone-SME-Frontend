import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";

/** Typed `useDispatch` — knows about the RTK Query middleware's thunks. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/** Typed `useSelector` — no `RootState` annotation needed at the call site. */
export const useAppSelector = useSelector.withTypes<RootState>();
