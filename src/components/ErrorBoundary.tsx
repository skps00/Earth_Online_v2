import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Logger } from '@/utils/logger';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    Logger.error('ErrorBoundary', `${error.message} ${info.componentStack ?? ''}`);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <View style={styles.container}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>{this.state.error?.message}</Text>
            <TouchableOpacity onPress={this.handleRetry} style={styles.btn}>
              <Text style={styles.btnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#161308' },
  icon: { fontSize: 48 },
  title: { color: '#eae2cf', fontSize: 18, fontWeight: '700', marginVertical: 12 },
  message: { color: '#999077', fontSize: 13, marginBottom: 20, textAlign: 'center' },
  btn: { paddingHorizontal: 24, paddingVertical: 10, borderWidth: 1, borderColor: '#66dd8b', borderRadius: 8 },
  btnText: { color: '#66dd8b', fontSize: 14, fontWeight: '700' },
});
