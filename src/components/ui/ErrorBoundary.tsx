"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertTitle, Button, Box } from "@mui/material";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={this.handleReset}>
                Retry
              </Button>
            }
            sx={{ maxWidth: 500, width: "100%" }}
          >
            <AlertTitle>Rendering Error</AlertTitle>
            {this.state.error?.message || "An unexpected error occurred in the UI."}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}
