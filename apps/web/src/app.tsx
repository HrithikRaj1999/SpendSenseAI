import { AuthProvider } from "./app/providers/AuthProvider";
import { AppRouter } from "./app/router/router";

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
