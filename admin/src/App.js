import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext/authContext";
import { UserProvider } from "./contexts/userContext/userContext";
import GuardRoute from "./components/Guard/GuardRoute/index";
import GuestRoute from "./components/Guard/GuestRoute/index";
import { DefaultLayout } from "./layout";
import { publicRoutes } from "./routes";
import { DarkModeProvider } from "./contexts/darkModeContext/darkModeContext";

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <DarkModeProvider>
          <Router>
            <div className="App">
              <Routes>
                {publicRoutes.map((page, index) => {
                  const Page = page.component;
                  let Layout = DefaultLayout;

                  if (page.layout) {
                    Layout = page.layout;
                  }

                  const Element = (
                    <Layout>
                      <Page />
                    </Layout>
                  );

                  if (page.requiredLogin) {
                    return (
                      <Route
                        path={page.path}
                        element={<GuardRoute>{Element}</GuardRoute>}
                        key={index}
                      />
                    );
                  } else if (page.guestOnly) {
                    return (
                      <Route
                        path={page.path}
                        element={<GuestRoute>{Element}</GuestRoute>}
                        key={index}
                      />
                    );
                  } else {
                    return (
                      <Route path={page.path} element={Element} key={index} />
                    );
                  }
                })}
                <Route
                  path="*"
                  element={<div>Not Found or You do not have permission.</div>}
                />
              </Routes>
            </div>
          </Router>
        </DarkModeProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;