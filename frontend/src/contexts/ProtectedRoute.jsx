import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
    const exp = localStorage.getItem("token_exp");

    // টোকেন না থাকলে
    if (!token) return <Navigate to="/" replace />;

    // টোকেন এক্সপায়ার হয়েছে কি না চেক
    if (exp && Date.now() >= exp * 1000) {
        localStorage.clear();
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
