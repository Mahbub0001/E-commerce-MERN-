import ProductAssistant from "../assistant/ProductAssistant";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="overflow-x-hidden">{children}</main>
      <Footer />
      <ProductAssistant />
    </div>
  );
}
