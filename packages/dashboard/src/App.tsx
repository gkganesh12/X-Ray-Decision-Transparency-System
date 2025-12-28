import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./auth/AuthContext";
import { ExecutionProvider } from "./context/ExecutionContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Login } from "./pages/Login";
import { ExecutionList } from "./pages/ExecutionList";
import { ExecutionDetail } from "./pages/ExecutionDetail";
import { ExecutionComparison } from "./pages/ExecutionComparison";
import { Analytics } from "./pages/Analytics";

function AppContent() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ExecutionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/executions/:id"
          element={
            <ProtectedRoute>
              <ExecutionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <ExecutionComparison />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ExecutionProvider>
            <AppContent />
          </ExecutionProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

