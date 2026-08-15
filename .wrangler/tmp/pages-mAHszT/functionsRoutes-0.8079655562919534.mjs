import { onRequest as __api_auth___route___ts_onRequest } from "/home/dadmor/code/ANNA-RYSNIK/anna-satelite-app/functions/api/auth/[[route]].ts"
import { onRequest as __api_creators_ts_onRequest } from "/home/dadmor/code/ANNA-RYSNIK/anna-satelite-app/functions/api/creators.ts"
import { onRequest as __api_follow_ts_onRequest } from "/home/dadmor/code/ANNA-RYSNIK/anna-satelite-app/functions/api/follow.ts"
import { onRequest as __api_me_ts_onRequest } from "/home/dadmor/code/ANNA-RYSNIK/anna-satelite-app/functions/api/me.ts"
import { onRequest as __api_progress_ts_onRequest } from "/home/dadmor/code/ANNA-RYSNIK/anna-satelite-app/functions/api/progress.ts"

export const routes = [
    {
      routePath: "/api/auth/:route*",
      mountPath: "/api/auth",
      method: "",
      middlewares: [],
      modules: [__api_auth___route___ts_onRequest],
    },
  {
      routePath: "/api/creators",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_creators_ts_onRequest],
    },
  {
      routePath: "/api/follow",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_follow_ts_onRequest],
    },
  {
      routePath: "/api/me",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_me_ts_onRequest],
    },
  {
      routePath: "/api/progress",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_progress_ts_onRequest],
    },
  ]