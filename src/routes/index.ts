import { route as v0Route } from "./v0";

export function mountRoutes(app: any) {
  app.use("/v0", v0Route);
}
