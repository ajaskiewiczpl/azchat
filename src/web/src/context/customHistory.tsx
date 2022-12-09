import { createBrowserHistory } from "@remix-run/router";

const customHistory = createBrowserHistory({ v5Compat: true });

export default customHistory;
