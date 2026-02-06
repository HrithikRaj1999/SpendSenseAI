import { AuthProvider } from "./app/providers/AuthProvider";
import { AppRouter } from "./app/router/router";
import { Provider } from "react-redux";
import { store } from "./app/store/store";

const App = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </Provider>
  );
};

export default App;
