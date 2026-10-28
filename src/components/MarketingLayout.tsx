import { Outlet } from "react-router-dom";
import { Layout } from "./Layout";

export function MarketingLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
