import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDialog({ visible, title, message, onConfirm, onCancel, confirmLabel, cancelLabel }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.surfaceHigh, borderColor: colors.primaryContainer }]}>
          <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
          <Text style={[styles.msg, { color: colors.onSurfaceVariant }]}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onCancel} style={[styles.btn, { borderColor: colors.outline }]}>
              <Text style={{ color: colors.onSurface }}>{cancelLabel ?? t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[styles.btn, { backgroundColor: colors.primaryContainer }]}>
              <Text style={{ color: colors.onPrimaryContainer, fontWeight: '700' }}>{confirmLabel ?? t('common.ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  dialog: { width: '85%', borderRadius: 12, borderWidth: 1, padding: 24 },
  title: { fontSize: 18, marginBottom: 8, fontWeight: '700' },
  msg: { fontSize: 14, marginBottom: 20 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
});
