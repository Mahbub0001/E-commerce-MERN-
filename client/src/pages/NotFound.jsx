import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";

export default function NotFound() {
  return (
    <PageTransition>
      <section className="container-pad grid min-h-[calc(100vh-10rem)] place-items-center py-12 text-center">
        <div>
          <p className="text-8xl font-black text-brand-600">404</p>
          <h1 className="mt-4 text-3xl font-black">Page not found</h1>
          <Button as={Link} to="/" className="mt-6">Go home</Button>
        </div>
      </section>
    </PageTransition>
  );
}
