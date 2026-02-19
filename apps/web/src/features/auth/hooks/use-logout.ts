import { useLogout as _useLogout } from "./useLogout";

// Compatibility wrapper: original `useLogout` returns a handler function.
// Some code expects an object with `{ handleLogout }`.
export function useLogout() {
	const handler = _useLogout();
	return { handleLogout: handler } as const;
}

export default useLogout;
