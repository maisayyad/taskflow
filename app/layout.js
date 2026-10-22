import "./globals.css";
import { AuthProvider } from "@/hooks/auth";

export const metadata = {
  title: "TaskFlow ",
  description:
    "Create projects, assign tasks, track progress and monitor deadlines with your team.",
};

// Applies the saved (or system) colour theme before first paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('taskflow-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children, modal }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AuthProvider>
          {children}
          {modal}
        </AuthProvider>
      </body>
    </html>
  );
}
