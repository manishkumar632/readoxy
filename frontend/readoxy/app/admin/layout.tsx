import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
export default function Layout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>){
    return(
        <div>
            <Header />
            <main>
                {children}
            </main>
            <Footer />
        </div>
    )
}