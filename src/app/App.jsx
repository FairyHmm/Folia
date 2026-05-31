import { MantineProvider } from "@mantine/core";
import { theme, resolver } from "./styles/theme";
import "@mantine/core/styles.css";
import Layout from "../features/layout/components/Layout";

export default function App() {
  return (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={resolver}
      defaultColorScheme="dark"
    >
      <Layout />
    </MantineProvider>
  );
}
