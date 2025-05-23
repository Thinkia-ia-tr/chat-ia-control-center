
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";

export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default Layout;
