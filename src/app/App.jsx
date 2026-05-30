import { MantineProvider } from "@mantine/core";
import { theme, resolver } from "./styles/theme";
import Graph from "../features/graph/components/Graph";

export default function App() {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={resolver}>
      <Graph />
    </MantineProvider>
  );
}
