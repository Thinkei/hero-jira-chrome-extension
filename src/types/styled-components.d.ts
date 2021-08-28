import "styled-components";

import { Theme } from "hero-design/types/theme";

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
