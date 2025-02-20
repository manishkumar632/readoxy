import Sidebar from "@/app/components/admin/Sidebar";
export default function Layout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>){
    return(
        <div className="flex">
            <Sidebar />
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}