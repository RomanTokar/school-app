import { NotificationProvider } from "./app/contexts/NotificationContext";
import { AuthProvider } from "./app/hooks/useAuth";
import { Layout } from "./components/Layout/Layout";
import i18n from "i18next";

function App() {
  document.body.dir = i18n.dir();
  const getUserLanguage = () => {
    const browserLng = window.navigator.language || window.navigator.language;
    return browserLng === "he" ? browserLng : "en";
  };
  i18n.changeLanguage(getUserLanguage());
  return (
    <AuthProvider>
      <NotificationProvider>
        <Layout />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
