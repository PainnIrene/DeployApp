import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext/authContext";
import { UserProvider } from "./contexts/userContext/userContext";
import GuardRoute from "./components/Guard/GuardRoute/index";
import GuestRoute from "./components/Guard/GuestRoute/index";
import { DefaultLayout } from "./layout";
import { publicRoutes } from "./routes";

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route
                path="*"
                element={<div>Not Found or You do not have permission.</div>}
              />

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
                    >
                      {/* Render route con nếu có */}
                      {page.children?.map((child, childIndex) => (
                        <Route
                          path={child.path}
                          element={<child.component />}
                          key={childIndex}
                        />
                      ))}
                    </Route>
                  );
                } else if (page.guestOnly) {
                  return (
                    <Route
                      path={page.path}
                      element={<GuestRoute>{Element}</GuestRoute>}
                      key={index}
                    >
                      {/* Render route con nếu có */}
                      {page.children?.map((child, childIndex) => (
                        <Route
                          path={child.path}
                          element={<child.component />}
                          key={childIndex}
                        />
                      ))}
                    </Route>
                  );
                } else {
                  return (
                    <Route path={page.path} element={Element} key={index}>
                      {/* Render route con nếu có */}
                      {page.children?.map((child, childIndex) => (
                        <Route
                          path={child.path}
                          element={<child.component />}
                          key={childIndex}
                        />
                      ))}
                    </Route>
                  );
                }
              })}
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
