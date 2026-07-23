import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
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
          <AppText style={[styles.title, { color: colors.onSurface }]}>{title}</AppText>
          <AppText style={[styles.msg, { color: colors.onSurfaceVariant }]}>{message}</AppText>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onCancel} style={[styles.btn, { borderColor: colors.outline }]}>
              <AppText style={[styles.btnText, { color: colors.onSurface }]}>{cancelLabel ?? t('common.cancel')}</AppText>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[styles.btn, { backgroundColor: colors.primaryContainer }]}>
              <AppText style={[styles.btnText, { color: colors.onPrimaryContainer, fontWeight: '700' }]}>
                {confirmLabel ?? t('common.ok')}
              </AppText>
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
  title: { fontSize: 18, marginBottom: 8, fontWeight: '700', lineHeight: 24 },
  msg: { fontSize: 14, marginBottom: 20, lineHeight: 20 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  btnText: { fontSize: 14, lineHeight: 20 },
});
