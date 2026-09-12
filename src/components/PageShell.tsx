import styled from "styled-components";

export const PageShellContent = styled.div<{ collapsed?: boolean }>`
  min-width: 0;
  flex: 1;
  margin-left: 248px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  body.sidebar-collapsed & {
    margin-left: 76px;
  }

  ${({ collapsed }) => collapsed !== undefined && `
    margin-left: ${collapsed ? "76px" : "248px"};
  `}

  @media (max-width: 900px) {
    margin-left: 0 !important;
  }
`;

export const PageShell = styled.div`
  min-height: 100vh;
  display: flex;
  background: transparent;

  &:has(aside.collapsed) ${PageShellContent},
  &:has([data-collapsed="true"]) ${PageShellContent},
  &:has(.collapsed) ${PageShellContent} {
    margin-left: 76px;
  }
`;
